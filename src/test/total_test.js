let userList = [];

const run_init_script = async () => {

  console.log("\n🔥 init script running...");

  /**
   * @USER
   * create
   * update
   */
  const usersToCreate = ["dohyulee", "AAAA"];
  await Promise.all(usersToCreate.map(name => signup(name)));

  for (let userData of userList) {

    console.log(`🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏`);
    console.log();
    console.log(`                       ${userData.login} Start`);
    console.log();
    console.log(`🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏`);

    const headers = userData.headers;

    /**
     * @USER
     * follow
     * unfollow
     */
    userList.filter(user => user.login !== userData.login).forEach( async user => {
      await follow(headers, user.login);
    });

    /**
     * @USER
     * findFollowers
     * findFollowings
     */
    await new Promise(resolve => setTimeout(resolve, 1000));
    await findFollowers(headers, userData.id);
    await findFollowings(headers, userData.id);

    /**
    * @PAPER
    * create
    * delete/:id
    * delete
    */
    const paperTitlesToCreate = ["AAAAA", "BBBBB", "CCCCC", "DDDDD", "EEEEE", "FFFFF", "GGGGG", "HHHHH", "IIIII", "JJJJJ", "KKKKK", "LLLLL", "MMMMM", "NNNNN", "OOOOO", "PPPPP", "QQQQQ", "RRRRR", "SSSSS", "TTTTT", "UUUUU", "VVVVV", "WWWWW", "XXXXX", "YYYYY", "ZZZZZ"];
    await Promise.all(paperTitlesToCreate.map(title => createPaper(headers, title)));
    const papers_del = await getPapers(headers);
    const paperIds_del = papers_del.filter(paper => paper.authorId === userData.id).map(paper => paper.id);
    await deletePaper(headers, paperIds_del[0]);
    await deletePaperByIds(headers, paperIds_del.slice(1));

    /**
     * @PAPER
     * get
     * update
     */
    await Promise.all(paperTitlesToCreate.map(title => createPaper(headers, title)));
    const papers = await getPapers(headers);
    const paperIds = papers.filter(paper => paper.authorId === userData.id).map(paper => paper.id);

    for (let paperId of paperIds) {
      await updatePaper(headers, paperId);
      await publishPaper(headers, paperId);
    }

    /**
     * @PAPER
     * like
     * unlike
     * bookmark
     * unbookmark
     */
    for (let paperId of paperIds) {
      likePaper(headers, paperId);
      bookmarkPaper(headers, paperId);
    }
    unlikePaper(headers, paperIds[0]);
    unBookmarkPaper(headers, paperIds[1]);

    /**
     * @COMMENT
     * create
     */
    const papersToPutComment = [0, 0, 1, 2, 3, 3, 3, 3, 3, 3];
    for (let paperId of papersToPutComment) {
      await createComment(headers, paperIds[paperId]);
    }

    /**
     * @COMMENT
     * get
     * update
     * delete
     */
    for (let pId of paperIds) {
      const comments = await getComments(headers, pId);
      const cIds = comments.filter(cmt => cmt.userId === userData.id).map(cmt => cmt.id);
      for (let cId of cIds) {
        await updateComment(headers, pId, cId);
        await deleteComment(headers, pId, cId);
      }
    }
    for (let pId of paperIds) {
      const cid = await createComment(headers, pId);
      await updateComment(headers, pId, cid);
    }

    /**
     * @TAG
     * create
     * update
     * get
     */
    await Promise.all(Array(5).fill().map(() => createTag(headers)));
    const tagIds = await getTags(headers, userData.id).then((res) => res.map(tag => tag.id));
    for (let tagId of tagIds)
      await updateTag(headers, tagId);

    /**
     * @CLIP
     * create
     * get
     */
    await Promise.all(Array(5).fill().map(() => createClip(userData)));

    console.log();
    console.log("[ 유저 ID로 클립 조회 ]", userData.login);
    const clipIds = await getClips(headers, { userId: userData.id }).then((res) => {
      if (res.message) {
        console.log(res);
        return [];
      }
      return res.map(clip => clip.id);
    });
    console.log(clipIds);
    console.log();

    console.log("[ 태그 ID로 클립 조회 ]");
    for (let tagId of tagIds) {
      const clipIdsByTag = await getClips(headers, { tagId }).then((res) => {
        if (res.message) {
          console.log(res);
          return [];
        }

        return res.map(clip => clip.id);
      });
      console.log(clipIdsByTag.length, clipIdsByTag);
    }
    console.log();

    console.log("[ 유저 ID와 태그 ID로 클립 조회 ]");
    for (let tagId of tagIds) {
      const clipIdsByTag = await getClips(headers, { userId: userData.id, tagId }).then((res) => {
        if (res.message) {
          console.log(res);
          return [];
        }

        return res.map(clip => clip.id);
      }
      );
      console.log(clipIdsByTag.length, clipIdsByTag);
    }

    /**
     * @CLIP
     * like
     * unlike
     */
    for (let clipId of clipIds) {
      await likeClip(headers, clipId);
    }
    await unlikeClip(headers, clipIds[0]);

    console.log();
    console.log(`✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅`);
    console.log();
    console.log(`                       ${userData.login} Done`);
    console.log(`                       ${userData.id}`);
    console.log();
    console.log(`✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅`);
    console.log();
  }
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


const signup = async (name) => {
  const signupRes = await fetch("http://localhost:3000/auth/signup", {
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
  }).then(res => res.json());

  userList.push({
    accessToken: signupRes.accessToken, refreshToken: signupRes.refreshToken, login: name, headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${signupRes.accessToken}`
    }
  });

  await fetch("http://localhost:3000/user/me", {
    method: "PATCH",
    headers: userList.find(user => user.login === name).headers,
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
    console.log(`👤 created & updated\n`, { login: res.login, id: res.id });
    userList.find(user => user.login === name).id = res.id;
  });
}

const follow = async (headers, loginToFollow) => {
  const users = await fetch(`http://localhost:3000/user/all`, {
    method: "GET",
    headers,
  }).then(res => res.json());

  const userIdToFollow = users.find(user => user.login === loginToFollow).id;

  await fetch(`http://localhost:3000/user/${userIdToFollow}/follow`, {
    method: "POST",
    headers,
  }).then(res => res.json())
    .then(res => {
      console.log(`👤 followed ${loginToFollow}`, { id: res.id });
    })

}

const findFollowers = async (headers, userId) => {
  await fetch(`http://localhost:3000/user/${userId}/follower`, {
    method: "GET",
    headers,
  }).then(res => res.json())
    .then(res => {
      console.log(`👤 followers`, res.map(e => e.Follower.login));
    });
}

const findFollowings = async (headers, userId) => {
  await fetch(`http://localhost:3000/user/${userId}/following`, {
    method: "GET",
    headers,
  }).then(res => res.json())
    .then(res => {
      console.log(`👤 followings`, res.map(e => e.Following.login));
    });
}

const getPapers = async (headers) => {
  return await fetch(`http://localhost:3000/paper/all`, {
    method: "GET",
    headers,
  }).then(res => res.json());
}

const createPaper = async (headers, title) => {
  let content = "haha this is conten";

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
      console.log(`📝 created`, { id: res.id, title: res.title });
      return res.id;
    });
}

const updatePaper = async (headers, paperId) => {
  let content = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua";

  await fetch(`http://localhost:3000/paper/${paperId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      "title": Math.random().toString(36).substring(2, 15),
      "content": content,
      "tags": ["CCCCC", "DDDDD", "😍"],
    })
  }).then(res => res.json())
    .then(res => {
      console.log(`📝 updated`, { id: res.id });
    });
}

const publishPaper = async (headers, paperId) => {
  await fetch(`http://localhost:3000/paper/${paperId}/publish`, {
    method: "PATCH",
    headers,
  }).then(res => res.json())
    .then(res => {
      console.log(`📝 published`, { id: res.id });
    });
}

const deletePaper = async (headers, paperId) => {
  await fetch(`http://localhost:3000/paper/${paperId}`, {
    method: "DELETE",
    headers,
  }).then(res => res.json())
    .then(res => {
      console.log(`📝 deleted`, { id: paperId, msg: res.message });
    });
}

const deletePaperByIds = async (headers, paperIds) => {
  await fetch(`http://localhost:3000/paper`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ ids: paperIds })
  }).then(res => res.json())
    .then(res => {
      console.log(`📝 deleted by ids`, { ids: paperIds, msg: res.message });
    });
}

const likePaper = async (headers, paperId) => {
  await fetch(`http://localhost:3000/paper/${paperId}/like`, {
    method: "POST",
    headers,
  });
}

const unlikePaper = async (headers, paperId) => {
  await fetch(`http://localhost:3000/paper/${paperId}/like`, {
    method: "DELETE",
    headers,
  });
}

const bookmarkPaper = async (headers, paperId) => {
  await fetch(`http://localhost:3000/paper/${paperId}/clip`, {
    method: "POST",
    headers,
  });
}

const unBookmarkPaper = async (headers, paperId) => {
  await fetch(`http://localhost:3000/paper/${paperId}/clip`, {
    method: "DELETE",
    headers,
  });
}

const getComments = async (headers, paperId) => {
  return await fetch(`http://localhost:3000/paper/${paperId}/comment`, {
    method: "GET",
    headers,
  }).then(res => res.json());
}

const createComment = async (headers, paperId) => {
  return await fetch(`http://localhost:3000/paper/${paperId}/comment`, {
    method: "POST",
    headers,
    body: JSON.stringify({ content: Math.random().toString(36).substring(2, 15) })
  }).then(res => res.json()).then(res => {
    console.log(`💬 created`, { id: res.id });
    return res.id;
  });
}

const updateComment = async (headers, paperId, cmtId) => {
  let content = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua";

  await fetch(`http://localhost:3000/paper/${paperId}/comment/${cmtId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ content })
  }).then(res => res.json()).then(res => {
    console.log(`💬 updated`, { id: res.id });
  });
}

const deleteComment = async (headers, paperId, cmtId) => {
  await fetch(`http://localhost:3000/paper/${paperId}/comment/${cmtId}`, {
    method: "DELETE",
    headers,
  }).then(res => res.json()).then(res => {
    console.log(`💬 deleted`, { id: cmtId, msg: res.message });
  });
}

const getTags = async (headers, userId) => {
  return await fetch(`http://localhost:3000/tag?userId=${userId}`, {
    method: "GET",
    headers,
  }).then(res => res.json());
}

const createTag = async (headers) => {
  return await fetch(`http://localhost:3000/tag`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name: "AAA", color: "#FFFFFF" })
  }).then(res => res.json())
    .then(res => {
      console.log(`🏷️ created`, { id: res.id, name: res.name, color: res.color });
      return res.id;
    });
}

const updateTag = async (headers, tagId) => {
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
      console.log(`🏷️ updated`, { id: res.id, name: res.name, color: res.color });
      return res.id;
    });
}

const createClip = async (userData) => {
  const headers = userData.headers;

  // get random tagIds, paperIds
  const tags = await getTags(headers, userData.id);
  const tagIds = tags.filter(tag => tag.userId === userData.id).map(tag => tag.id);
  const randomTagIds = tagIds.sort(() => Math.random() - Math.random()).slice(0, 3);
  const paperIds = await getPapers(headers).then((res) => res.map(paper => paper.id));
  const randomPaperIds = paperIds.sort(() => Math.random() - Math.random()).slice(0, 3);

  // get random date
  const start = new Date(2020, 0, 1);
  const end = new Date();
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  const randomEndDate = new Date(randomDate.getTime() + Math.random() * (end.getTime() - randomDate.getTime()));

  const body = {
    "title": "AAAA",
    "content": "aaaa",
    "startedAt": randomDate,
    "endedAt": randomEndDate,
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

const getClips = async (headers, { userId, tagId }) => {
  let url = "http://localhost:3000/clip?";
  if (userId && tagId)
    url += `userId=${userId}&tagId=${tagId}`;
  else if (userId)
    url += `userId=${userId}`;
  else if (tagId)
    url += `tagId=${tagId}`;

  console.log();
  console.log('GET', url);
  return await fetch(url, {
    method: "GET",
    headers,
  }).then(res => res.json());
}

const likeClip = async (headers, clipId) => {
  await fetch(`http://localhost:3000/clip/${clipId}/like`, {
    method: "POST",
    headers,
  }).then(res => res.json()).then(res => {
    console.log(`🧷 liked`, { id: res.id });
  });
}

const unlikeClip = async (headers, clipId) => {
  await fetch(`http://localhost:3000/clip/${clipId}/like`, {
    method: "DELETE",
    headers,
  }).then(res => res.json()).then(res => {
    console.log(`🧷 unliked`, { id: res.id });
  });
}

export { run_init_script }