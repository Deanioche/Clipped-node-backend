import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { config } from 'dotenv';
import { User } from '../src/models/user.js';
import sequelize from '../src/utils/db.js';
import jwt from 'jsonwebtoken';
import '../src/utils/associations.js';
import { Follow } from '../src/models/follow.js';
import { Paper } from '../src/models/paper.js';
import { PaperComment } from '../src/models/paperComment.js';
import { Tag } from '../src/models/tag.js';
import { Clip, Clip_link } from '../src/models/clip.js';

config();
const env = process.env;

let userList = [];

(async () => {

  await sequelize.sync({ force: true })
  await seed().then(async () => {
    console.log("🌱 seed done");
  });
})();

const sync = async (space = false) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  if (space) console.log();
}

const seed = async () => {

  /**
   * @USER
   * create
   * update
   * read
   */
  await createUser("AAAA");
  await createUser("BBBB");
  await createUser("CCCC");
  userList = await User.findAll();
  console.log(`created users`, userList.map(user => user.login));
  await sync(true);

  /**
   * @USER
   * follow
   * unfollow
   * findFollowers
   * findFollowings
   */
  userList.map(user => followOthers(user));
  await sync();
  // userList.map(user => unfollowRandomOne(user));
  // await sync();
  userList.map(user => findFollowers(user));
  await sync();
  userList.map(user => findFollowings(user));
  await sync(true);

  /**
   * @PAPER
   * create
   * publish (random)
  */
  userList.map(user => { [...Array(5)].map(() => createPaper(user)) });
  await sync();
  const papers = await Promise.all(userList.map(user => getPapers(user))).then(res => res.flat());
  console.log('📝 created', papers.length);
  console.log(papers.map(paper => paper.id));
  await sync(true);

  /**
   * @PAPER
   * like
   * bookmark
  */
  userList.map(user => likePaper(user, papers[0]));
  userList.map(user => likePaper(user, papers[1]));
  await sync(true);
  userList.map(user => bookmarkPaper(user, papers[0]));
  userList.map(user => bookmarkPaper(user, papers[1]));
  await sync(true);

  /**
   * @COMMENT
   * create
  */
  userList.map(user => createComment(user, papers[0]));
  userList.map(user => createComment(user, papers[1]));
  userList.map(user => createComment(user, papers[2]));
  await sync(true);

  /**
   * @TAG
   * create
   * get
  */
  userList.map(user => [...Array(5)].map(e => createTag(user)));
  await sync(true);

  /**
   * @CLIP
   * create
   * like
  */
  userList.map(user => [...Array(50)].map(e => createClip(user)));
  await sync(true);
  
  userList.map(user => likeClip(user));
  await sync(true);
}

/**
 * 
 * 
 * 
 * 
 *  Functions
 * 
 * 
 * 
 */

const createUser = async (login) => {
  const newUser = await User.create({
    email: faker.internet.email(),
    name: faker.person.fullName(),
    login,
    password: bcrypt.hashSync("123456", 10),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  });

  const refreshToken = jwt.sign({ id: newUser.id }, env.JWT_RT_SECRET, { expiresIn: env.JWT_RT_EXPIRES_IN });
  await User.update({
    username: faker.internet.userName(),
    oneline: faker.lorem.sentence(),
    hashtags: faker.lorem.words(),
    profileImage: faker.image.avatar(),
    school: faker.lorem.word(),
    major: faker.lorem.word(),
    entryYear: faker.date.past().getFullYear(),
    job: faker.lorem.word(),
    refreshToken,
  }, {
    where: {
      id: newUser.id,
    }
  });
}

const followOthers = async (me) => {
  const others = userList.filter(user => user.id !== me.id).map(user => user.id);
  return await Promise.all(others.map(other =>
    Follow.create({
      followerId: me.id,
      followingId: other,
      createdAt: faker.date.past(),
    })
  ));
}

const unfollowRandomOne = async (me) => {
  const one = userList.filter(user => user.id !== me.id).map(user => user.id).sort(() => Math.random() - Math.random())[0];

  await Follow.destroy({
    where: {
      followerId: me.id,
      followingId: one
    }
  });
}

const findFollowers = async (me) => {

  const followers = await Follow.findAll({
    where: {
      followingId: me.id
    },
    include: [
      {
        model: User,
        as: 'Follower'
      }
    ]
  });
  console.log(`👥 ${me.login} is followed by`, followers.map(follower => follower.Follower.login));
}

const findFollowings = async (me) => {
  const followings = await Follow.findAll({
    where: {
      followerId: me.id
    },
    include: [
      {
        model: User,
        as: 'Following'
      }
    ]
  });
  console.log(`👥 ${me.login} is following`, followings.map(following => following.Following.login));
}

const getPapers = async (me) => {
  return await Paper.findAll({
    where: {
      authorId: me.id
    }
  })
}

const createPaper = async (me) => {
  return await Paper.create({
    title: faker.lorem.words(),
    content: faker.lorem.paragraph(),
    authorId: me.id,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    publishedAt: (Math.random() > 0.5 ? faker.date.recent() : null),
  });
}

const likePaper = async (me, paper) => {
  return await paper.addPaperLike(me).then(res => {
    console.log(`📝 ${me.login} liked`, paper.id);
    return res;
  });
}

const bookmarkPaper = async (me, paper) => {
  return await paper.addBookmark(me).then(res => {
    console.log(`📝 ${me.login} bookmarked`, paper.id);
    return res;
  });
}

const createComment = async (me, paper) => {
  return await PaperComment.create({
    paperId: paper.id,
    userId: me.id,
    content: faker.lorem.paragraph(),
    createdAt: faker.date.past(),
  }).then(res => {
    console.log(`📝 ${me.login} commented`, paper.id);
    return res;
  });
}

const createTag = async (me) => {
  return await Tag.create({
    userId: me.id,
    name: faker.music.genre(),
    color: faker.internet.color(),
    createdAt: faker.date.past(),
  }).then(res => {
    console.log(`🏷 ${me.login} created`, res.id);
    return res;
  });
}

const getTags = async (me) => {
  return await Tag.findAll({
    where: {
      userId: me.id
    }
  });
}

const createClip = async (me) => {

  const tagIds = await getTags(me).then((res) => res.map(tag => tag.id));
  const randomTagIds = tagIds.sort(() => Math.random() - Math.random()).slice(0, 3);
  const paperIds = await getPapers(me).then((res) => res.map(paper => paper.id));
  const randomPaperIds = paperIds.sort(() => Math.random() - Math.random()).slice(0, 3);

  const newClip = await Clip.create({
    id: faker.string.uuid(),
    userId: me.id,
    title: faker.lorem.words(),
    content: faker.lorem.paragraph(),
    startedAt: faker.date.past(),
    endedAt: faker.date.recent(),
    tags: randomTagIds,
    papers: randomPaperIds,
    publishdAt: (Math.random() > 0.5 ? faker.date.recent() : null),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  });
  newClip.addPapers(randomPaperIds);
  newClip.addTags(randomTagIds);
  Clip_link.create({ clipId: newClip.id, link: faker.internet.url() });
  Clip_link.create({ clipId: newClip.id, link: faker.internet.url() });

  console.log(`🧷 ${me.login} created`, newClip.id);
}

const getClips = async (me) => {
  return await Clip.findAll();
}

const likeClip = async (me) => {
  const clips = await getClips(me).then((res) => res.filter(c => c.id !== me.id));
  const randomClips = clips.sort(() => Math.random() - Math.random()).slice(0, 3);
  randomClips.map(clip => clip.addClipLike(me));
  console.log(`🧷 ${me.login} liked clip`, randomClips.map(clip => clip.id));
}
