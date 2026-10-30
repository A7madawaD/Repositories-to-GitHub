// Main Variables
let theInput = document.querySelector(".get-repos input");
let getButton = document.querySelector(".get-button");
let reposData = document.querySelector(".show-data");

//  البحث عند النقر على الزر
getButton.onclick = function () {
  getRepos();
};

//  البحث عند الضغط على مفتاح Enter
theInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    getRepos();
  }
});

// Get Repos Function
function getRepos() {
  if (theInput.value == "") {
    reposData.innerHTML = "<span>Please Write Github Username.</span>";
  } else {
    reposData.innerHTML = "<span>Loading Profile & Repos... ⏳</span>";

    // سنقوم بجلب بيانات المستخدم ومعلوماته بالتوازي مع المستودعات
    let username = theInput.value;

    Promise.all([
      fetch(`https://api.github.com/users/${username}`).then((res) => {
        if (!res.ok) throw new Error("User Not Found");
        return res.json();
      }),
      fetch(`https://api.github.com/users/${username}/repos`).then((res) => {
        if (!res.ok) throw new Error("Repos Not Found");
        return res.json();
      }),
    ])
      .then(([userProfile, repositories]) => {
        // تفريغ الحاوية
        reposData.innerHTML = "";

        // ---  إنشاء بطاقة معلومات المستخدم الشخصية (Profile Card) ---
        let profileCard = document.createElement("div");
        profileCard.className = "profile-card";
        profileCard.style.cssText =
          "background: #fff; padding: 20px; margin-bottom: 15px; border-radius: 6px; display: flex; align-items: center; gap: 20px;";

        let avatar = document.createElement("img");
        avatar.src = userProfile.avatar_url;
        avatar.style.cssText =
          "width: 80px; height: 80px; border-radius: 50%; object-fit: cover;";
        profileCard.appendChild(avatar);

        let profileInfo = document.createElement("div");

        let nameH3 = document.createElement("h3");
        nameH3.textContent = userProfile.name || userProfile.login;
        nameH3.style.margin = "0 0 5px 0";
        profileInfo.appendChild(nameH3);

        if (userProfile.bio) {
          let bioP = document.createElement("p");
          bioP.textContent = userProfile.bio;
          bioP.style.cssText =
            "margin: 0 0 10px 0; color: #666; font-size: 14px;";
          profileInfo.appendChild(bioP);
        }

        let statsSpan = document.createElement("span");
        statsSpan.textContent = `Public Repos: ${userProfile.public_repos} | Followers: ${userProfile.followers}`;
        statsSpan.style.cssText =
          "font-size: 13px; color: #888; font-weight: bold;";
        profileInfo.appendChild(statsSpan);

        profileCard.appendChild(profileInfo);
        reposData.appendChild(profileCard);

        // --- 2. التحقق من وجود مستودعات ---
        if (repositories.length === 0) {
          let noRepos = document.createElement("span");
          noRepos.textContent = "This user has no public repositories.";
          reposData.appendChild(noRepos);
          return;
        }

        // --- 3. عرض المستودعات ---
        repositories.forEach((repo) => {
          let mainDiv = document.createElement("div");
          mainDiv.className = "repo-box";

          // اسم المستودع
          let repoName = document.createTextNode(repo.name);
          mainDiv.appendChild(repoName);

          // رابط الزيارة
          let theUrl = document.createElement("a");
          theUrl.appendChild(document.createTextNode("Visit"));
          theUrl.href = repo.html_url;
          theUrl.setAttribute("target", "_blank");
          mainDiv.appendChild(theUrl);

          // النجوم
          let starsSpan = document.createElement("span");
          starsSpan.appendChild(
            document.createTextNode(`Stars ${repo.stargazers_count}`),
          );
          mainDiv.appendChild(starsSpan);

          // لغة البرمجة
          if (repo.language) {
            let langSpan = document.createElement("span");
            langSpan.appendChild(document.createTextNode(repo.language));
            langSpan.style.backgroundColor = "#673AB7";
            mainDiv.appendChild(langSpan);
          }

          // الوصف
          if (repo.description) {
            let descP = document.createElement("p");
            descP.appendChild(document.createTextNode(repo.description));
            descP.style.cssText =
              "color: #555; font-size: 14px; margin-top: 8px;";
            mainDiv.appendChild(descP);
          }

          reposData.appendChild(mainDiv);
        });
      })
      .catch((error) => {
        reposData.innerHTML = `<span>${error.message === "User Not Found" ? "User Not Found ❌" : "Error fetching data! ❌"}</span>`;
      });
  }
}
