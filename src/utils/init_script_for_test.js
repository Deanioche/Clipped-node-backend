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
  let content = "";
  await fetch("https://baconipsum.com/api/?type=all-meat&paras=1", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  }).then(res => res.json()).then(res => {
    content = res[0];
  });

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

const createComment = async (paperId) => {
  return await fetch(`http://localhost:3000/paper/${paperId}/comment`, {
    method: "POST",
    headers,
    body: JSON.stringify({ content: "ABCABC123" })
  }).then(res => res.json()).then(res => {
    console.log(`💬 created`, res.content.substring(0, 20));
    return res.id;
  });
}

const updateComment = async (paperId, cmtId) => {
  let content = "";
  await fetch("https://baconipsum.com/api/?type=all-meat&paras=1", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  }).then(res => res.json()).then(res => {
    content = res[0];
  });

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
const run_init_script = async () => {

  // signup, update user
  await signup("dohyulee");
  await signup("AAAA");

  // follow, unfollow
  await follow("dohyulee");

  // create paper, publish
  const paperTitlesToCreate = ["AAAAA", "BBBBB", "CCCCC", "DDDDD"];
  const papers = await Promise.all(paperTitlesToCreate.map(title => createPaper(title)));

  // like, unlike, bookmark, unbookmark papers
  for (let paperId of papers) {
    likePaper(paperId);
    bookmarkPaper(paperId);
  }
  unlikePaper(papers[0]);
  unBookmarkPaper(papers[1]);

  // create comments
  const papersToPutComment = [0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 3];
  for (let paperId of papersToPutComment) {
    await createComment(papers[paperId]);
  }

  // update or delete comments
  const paperIds = await getPapers().then((res) => res.map(paper => paper.id));
  for (let pId of paperIds) {
    const cIds = await fetch(`http://localhost:3000/paper/${pId}/comment`, {
      method: "GET",
      headers,
    }).then(res => res.json()).then(res => {
      return res.map(cmt => cmt.id);
    });
    for (let cId of cIds) {
      // update or delete comments with 50% probability
      if (Math.random() < 0.5)
        deleteComment(pId, cId);
      else
        updateComment(pId, cId);
    }
  }

  // create tag

  // create clip

  console.log("🔥 init script done!\n", userData);
}

export { run_init_script }