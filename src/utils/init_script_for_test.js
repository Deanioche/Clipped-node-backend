let accessToken = "";
let refreshToken = "";
let userData = {
  login: "",
  id: "",
};
const headers = {
  "Content-Type": "application/json",
  "authorization": `Bearer ${accessToken}`
}

const signup = async (name) => {
  await fetch("http://localhost:3000/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "email": `${name}@example.com`,
      "name": "Dohyu Lee",
      "login": name,
      "password": "123456"
    })
  }).then(res => res.json()).then(res => {
    accessToken = res.accessToken;
    refreshToken = res.refreshToken;
    headers.authorization = `Bearer ${accessToken}`;
  });

  await fetch("http://localhost:3000/user/me", {
    method: "PATCH",
    headers,
    body: JSON.stringify(
      {
        "email": `${name}_2@example.com`,
        "username": name,
        "oneline": "123",
        "hashtags": "123",
        "profileImage": "123",
        "school": "123",
        "major": "123",
        "entryYear": "123",
        "job": "123"
      }
    )
  }).then(res => res.json()).then(res => {
    userData.login = res.login;
    userData.id = res.id;
  });
}

const follow = async (loginToFollow) => {
  const users = await fetch(`http://localhost:3000/user/all`, {
    method: "GET",
    headers,
  }).then(res => res.json());

  const userIdToFollow = users.find(user => user.login === loginToFollow).id;

  await fetch(`http://localhost:3000/user/${userIdToFollow}/follow`, {
    method: "POST",
    headers,
  }).then(res => res.json());

  await fetch(`http://localhost:3000/user/${userIdToFollow}/follow`, {
    method: "DELETE",
    headers,
  }).then(res => res.json());

  await fetch(`http://localhost:3000/user/${userIdToFollow}/follow`, {
    method: "POST",
    headers,
  }).then(res => res.json());
}

const getPapers = async () => {
  return await fetch(`http://localhost:3000/paper/all`, {
    method: "GET",
    headers,
  }).then(res => res.json());
}

const createPaper = async (title) => {

  // load lorem ipsum sentences
  let content = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor \
  incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation \
  ullamco laboris nisi ut aliquip ex ea commodo consequat";

  return await fetch("http://localhost:3000/paper", {
    method: "POST",
    headers,
    body: JSON.stringify({
      "title": title,
      "content": content,
      "tags": ["AAA", "BBB"]
    })
  }).then(res => res.json())
    .then(res => {
      // publish paper
      fetch(`http://localhost:3000/paper/${res.id}/publish`, {
        method: "PATCH",
        headers,
      }).then(res => res.json()).then(res => {
        console.log(`📝 created`, res.title);
      });
      return res.id;
    });
}

const likePaper = async (paperId) => {
  await fetch(`http://localhost:3000/paper/${paperId}/like`, {
    method: "POST",
    headers,
  });
}

const unlikePaper = async (paperId) => {
  await fetch(`http://localhost:3000/paper/${paperId}/like`, {
    method: "DELETE",
    headers,
  });
}

const bookmarkPaper = async (paperId) => {
  await fetch(`http://localhost:3000/paper/${paperId}/clip`, {
    method: "POST",
    headers,
  });
}

const unBookmarkPaper = async (paperId) => {
  await fetch(`http://localhost:3000/paper/${paperId}/clip`, {
    method: "DELETE",
    headers,
  });
}

const getComments = async (paperId) => {
  return await fetch(`http://localhost:3000/paper/${paperId}/comment`, {
    method: "GET",
    headers,
  }).then(res => res.json());
}

const createComment = async (paperId) => {
  return await fetch(`http://localhost:3000/paper/${paperId}/comment`, {
    method: "POST",
    headers,
    body: JSON.stringify({ content: Math.random().toString(36).substring(2, 15) })
  }).then(res => res.json()).then(res => {
    console.log(`💬 created`, res.content.substring(0, 20));
    return res.id;
  });
}

const updateComment = async (paperId, cmtId) => {
  let content = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua";

  await fetch(`http://localhost:3000/paper/${paperId}/comment/${cmtId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ content })
  }).then(res => res.json()).then(res => {
    console.log(`💬 updated`, res.content.substring(0, 20));
  });
}

const deleteComment = async (paperId, cmtId) => {
  await fetch(`http://localhost:3000/paper/${paperId}/comment/${cmtId}`, {
    method: "DELETE",
    headers,
  }).then(res => res.json()).then(res => {
    console.log(`💬`, res);
  });
}

const getTags = async () => {
  return await fetch(`http://localhost:3000/tag`, {
    method: "GET",
    headers,
  }).then(res => res.json());
}

const createTag = async () => {
  return await fetch(`http://localhost:3000/tag`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name: "AAA", color: "#FFFFFF" })
  }).then(res => res.json())
    .then(res => {
      console.log(`🏷️ created`, res.name, res.color);
      return res.id;
    });
}

const updateTag = async (tagId) => {
  let name = "";
  for (let i = 0; i < 3; i++)
    name += String.fromCharCode(65 + Math.floor(Math.random() * 26));

  let color = "#";
  for (let i = 0; i < 6; i++)
    color += Math.floor(Math.random() * 16).toString(16);

  return await fetch(`http://localhost:3000/tag/${tagId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ name, color })
  }).then(res => res.json())
    .then(res => {
      console.log(`🏷️ updated`, res.name, res.color);
      return res.id;
    });
}

const createClip = async () => {
  const tagIds = await getTags().then((res) => res.map(tag => tag.id));
  const randomTagIds = tagIds.sort(() => Math.random() - Math.random()).slice(0, 3);
  const paperIds = await getPapers().then((res) => res.map(paper => paper.id));
  const randomPaperIds = paperIds.sort(() => Math.random() - Math.random()).slice(0, 3);

  const body = {
    "title": "AAAA",
    "content": "aaaa",
    "startedAt": new Date('2021-01-01T00:00:00.000Z'),
    "endedAt": new Date('2022-01-01T00:00:00.000Z'),
    "tags": randomTagIds,
    "papers": randomPaperIds,
    "links": ["https://google.com/", "https://naver.com/", "https://github.com/"],
    "publish": false
  };

  await fetch(`http://localhost:3000/clip`, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  }).then(res => res.json())
    .then(res => {
      console.log(`🧷 created`, res.id);
      // console.log(randomTagIds.length, randomTagIds);
      return res.id;
    });
}

const getClips = async ({ userId, tagId }) => {
  let url = "http://localhost:3000/clip?";
  console.log('userId, tagId', userId, tagId);
  if (userId && tagId)
    url += `userId=${userId}&tagId=${tagId}`;
  else if (userId)
    url += `userId=${userId}`;
  else if (tagId)
    url += `tagId=${tagId}`;
  return await fetch(url, {
    method: "GET",
    headers,
  }).then(res => res.json());
}

const run_init_script = async () => {

  console.log("\n🔥 init script running...");

  // signup, update user
  await signup("dohyulee");
  await signup("AAAA");

  // follow, unfollow
  await follow("dohyulee");

  // create paper, publish
  const paperTitlesToCreate = ["AAAAA", "BBBBB", "CCCCC", "DDDDD"];
  await Promise.all(paperTitlesToCreate.map(title => createPaper(title)));
  const paperIds = await getPapers().then((res) => res.map(paper => paper.id));

  // like, unlike, bookmark, unbookmark paperIds
  for (let paperId of paperIds) {
    likePaper(paperId);
    bookmarkPaper(paperId);
  }
  unlikePaper(paperIds[0]);
  unBookmarkPaper(paperIds[1]);

  // create comments
  const papersToPutComment = [0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 3];
  for (let paperId of papersToPutComment) {
    await createComment(paperIds[paperId]);
  }

  // update or delete comments
  for (let pId of paperIds) {
    await getComments(pId);
    const cIds = await getComments(pId).then((res) => res.map(cmt => cmt.id));
    for (let cId of cIds)
      // update or delete comments with 50% probability
      (Math.random() < 0.5) ? updateComment(pId, cId) : deleteComment(pId, cId);
  }

  // create, get, update tag
  await Promise.all(Array(5).fill().map(() => createTag()));
  const tagIds = await getTags().then((res) => res.map(tag => tag.id));
  for (let tagId of tagIds)
    await updateTag(tagId);
  
  // create, get clip
  await Promise.all(Array(5).fill().map(() => createClip()));
  const clipIds = await getClips({ userId: userData.id }).then((res) => res.map(clip => clip.id));
  console.log();
  console.log("유저 ID로 클립 조회");
  console.log(`getClips({ userId: ${userData.id} })\n`, clipIds);
  console.log();

  console.log("태그 ID로 클립 조회");
  for (let tagId of tagIds) {
    const clipIdsByTag = await getClips({ tagId }).then((res) => res.map(clip => clip.id));
    console.log(`getClips({ tagId: ${tagId} })\n`, clipIdsByTag.length, clipIdsByTag);
  }
  console.log();

  console.log("유저 ID와 태그 ID로 클립 조회");
  for (let tagId of tagIds) {
    const clipIdsByTag = await getClips({ userId: userData.id, tagId }).then((res) => res.map(clip => clip.id));
    console.log(`getClips({ userId: ${userData.id}, tagId: ${tagId} })\n`, clipIdsByTag.length, clipIdsByTag);
  }


  console.log("🔥 init script done!\n", userData);
}

export { run_init_script }