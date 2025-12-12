const projectUrl = "https://xdxvkllzwstmrmokdmln.supabase.co"
const projectKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkeHZrbGx6d3N0bXJtb2tkbWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNTM4NTIsImV4cCI6MjA3NjcyOTg1Mn0.RS9qWIFBRqO6ganf9gdJapE-4hYzXOK56MJCNzZcKpA"
const { createClient } = supabase;
const client = createClient(projectUrl, projectKey)

console.log(createClient);
console.log(client);

// ===========SIGN UP WORK=============

const username = document.getElementById("username")
const email = document.getElementById("email")
const password = document.getElementById("password")
const profile_pic = document.getElementById("profile_pic")
const btn = document.getElementById("btn")
btn && btn.addEventListener("click", async () => {
    try {
        let insertImg = profile_pic.files[0]
        let insertImgName = `${Date.now()}_${insertImg.name}`

        if (!username.value || !email.value || !password.value || !insertImg) {
            alert("Plaease enter All Fields!")
        } else {

            const { data, error } = await client.auth.signUp({
                email: email.value,
                password: password.value,
                options: {
                    data: {
                        username: username.value,
                    }
                }
            })

            const { data: uploadProfileData, error: uploadProfile } = await client
                .storage
                .from('profiles')
                .upload(insertImgName, insertImg, {
                    upsert: true
                })
            if (uploadProfile) {
                console.log("profile UploadError", uploadProfile.message);
            } else {
                console.log(uploadProfileData, "insert Successfully!");

                const { data: pblicUrl } = client
                    .storage
                    .from('profiles')
                    .getPublicUrl(insertImgName)

                if (pblicUrl) {
                    console.log("public url data", pblicUrl);
                    window.publicImgUrll = pblicUrl.publicUrl
                }

            }

            if (data) {
                console.log(data.user.user_metadata);
                userinfo = data.user.user_metadata
                let { username, email } = userinfo

                const { error } = await client
                    .from('users-data')
                    .insert({ name: username, email: email, profile_pic: publicImgUrll })

                if (error) {
                    console.log("USER DATA ERROR", error);
                } else {
                    // alert("DATA INSERT SUCCESSFULLY")
                    console.log("DATA INSERT SUCCESSFULLY");

                }
            }

            if (data) {
                console.log(data);

                Swal.fire({
                    title: "Successfully Signup!\n Redirecting to Login Page",
                    icon: "success",
                    draggable: true,
                    timer: 2000
                });

                // setTimeout(() => {

                window.location.href = "login.html"
                // }, 2000)
            }
            else {
                console.log(error, error.message);

            }
        }
    } catch (error) {
        console.log(error);
    }
})


// ============LOGIN WORK============

const loginEmail = document.getElementById("loginEmail")
const loginPassword = document.getElementById("loginPassword")
const loginBtn = document.getElementById("loginBtn")

loginBtn && loginBtn.addEventListener("click", async () => {

    try {
        if (!loginEmail.value || !loginPassword.value) {
            alert("Plaease enter All Fields!")
        }
        const { data, error } = await client.auth.signInWithPassword({
            email: loginEmail.value,
            password: loginPassword.value,
        })

        if (error) {
            alert("Login failed!")
            console.log(error.message);
        }
        else {
            console.log(data);
            // alert("redirect to Home page...")

            Swal.fire({
                title: "Successfully Loged in!\n Redirecting to post Page",
                icon: "success",
                draggable: true,
                timer: 2000
            });


            setTimeout(() => {

                window.location.href = "createPost.html"
            }, 2000)

        }
    } catch (error) {
        console.log(error);
    }
})

// ===============GET USER DATA============

async function getUserData() {
    try {
        const showUserName = document.getElementById("showUserName")
        const { data, error } = await client.auth.getUser()
        console.log(data, "user data");
        showUserName.innerHTML = data.user.user_metadata.username
        if (error) {
            console.log(error, "GEtting user error", error.message);
        }
    } catch (error) {
        console.log(error, "Error in getting user", error.message)
    }
}

getUserData()

// ==========LOGOUT WORK============

const logoutBtn = document.getElementById("logoutBtn")
logoutBtn && logoutBtn.addEventListener("click", async () => {
    const { error } = await client.auth.signOut()
    if (error) {
        console.log(error, error.message);
    } else {
        // alert("Logout Successfully")
        Swal.fire({
            title: "Logout Successfully!",
            icon: "success",
            draggable: true,
            timer: 2000
        });

        window.location.href = "login.html"
    }
})


// ========CREATE POSTWORK===========

const showStatus = document.getElementsByName("showStatus")
const title = document.getElementById("title")
const description = document.getElementById("description")
const submitBtn = document.getElementById("submitBtn")

submitBtn && submitBtn.addEventListener("click", async () => {
    let selectedInp = null
    for (let i = 0; i < showStatus.length; i++) {
        if (showStatus[i].checked) {
            selectedInp = showStatus[i]
            console.log(selectedInp);
            break;
        }
    }


    if (!title.value || !description.value || !selectedInp) {
        alert("Please Enter All Feilds!")
        return;
    }
    const { data: getUserData, error: getUserError } = await client.auth.getUser()
    console.log(getUserData);

    const { error } = await client
        .from('user-posts')
        .insert({
            Title: title.value,
            Description: description.value,
            Priority: selectedInp.value,
            email: getUserData.user.email
        })

    if (error) {
        console.log(error, error.message);
    } else {
        // alert("DATA INSERT SUCCESSFULLY!!")
        Swal.fire({
            title: "Post Added Successfully!",
            icon: "success",
            draggable: true,
            timer: 2000
        });
        title.value = ""
        description.value = ""
        selectedInp.checked = false
        window.location.href = "post.html"
    }

})

//  ===========Fetch POST===========
let color = undefined
const contentDiv = document.getElementById("contentDiv")
async function showAllPosts() {
    try {
        const { data: posts, error } = await client
            .from('user-posts')
            .select("*")

        const { data: users, error: userError } = await client
            .from('users-data')
            .select("*")

        const mergedData = posts.map(post => {
            const user = users.find(u => u.email === post.email);

            return {
                ...post,
                userName: user?.name,
                userPic: user?.profile_pic
            };
        });


        if (error) {
            console.log(error, error.message);
        }

        contentDiv.innerHTML = ""


        mergedData.forEach(post => {
            console.log(post);

            if (post.Priority == 'high') {
                color = 'green'
            } else if (post.Priority == 'low') {
                color = 'red'
            } else {
                color = 'orange'
            }

            const time = new Date(post.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            });
            contentDiv.innerHTML += ` 
       <div class="border-info p-2 zoom-card" 
     style="width: 24rem; border:3px solid cyan; border-radius:30px; 
            box-shadow: 0px 0px 15px rgb(196, 249, 255)">

    <!-- TOP PROFILE ROW -->
    <div class="d-flex align-items-center gap-3 p-2">
        <img src="${post.userPic}" 
             alt="profile" 
             style="width:50px; height:50px; border-radius:50%; box-shadow:0px 0px 2px gray; object-fit:cover;">

        <div>
            <p class="m-0 fw-bold fs-5">${post.userName}</p>
            <p class="m-0 text-secondary" style="font-size: 14px;">${time}</p>
        </div>
    </div>

    <ul class="list-group list-group-flush">
        <li class="list-group-item fs-2">${post.Title}</li>
        <li class="list-group-item fs-5">${post.Description}</li>

        <li class="list-group-item fs-5 d-flex align-items-center gap-2">
            <div style="width: 20px; height: 20px; background-color: ${color}; border-radius: 50%;"></div>
            ${post.Priority}
        </li>
    </ul>

    <div class="d-flex gap-2 justify-content-start ms-3 my-2">
        <button class="border-0 bg-info d-flex justify-content-center align-items-center gap-2 
                       text-light fs-5 fw-bold px-3 py-1 rounded-5"
                onClick="editPost(${post.id},'${post.Title}','${post.Description}', '${post.Priority}')">
            Edit 
            <i class="fa-solid fa-pen-to-square fa-sm mb-1" style="color: #ffffff;"></i>
        </button>

        <button class="border-0 bg-info d-flex justify-content-center align-items-center gap-2 
                       text-light fs-5 fw-bold px-3 py-1 rounded-5"
                onClick="deletePost(${post.id})">
            Delete 
            <i class="fa-solid fa-trash fa-xs"></i>
        </button>
    </div>

</div>

        
        `
        });
    } catch (error) {
        console.log(error, error.message);
    }
}

showAllPosts()


// ========BTN CLICK ALL DATA SHOW==========

const allPost = document.getElementById("allPost")
allPost && allPost.addEventListener("click", async () => {
    showAllPosts()
})

// ========high Work=======

const highBtn = document.getElementById("highBtn");

highBtn && highBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const { data: highPost, error } = await client
        .from('user-posts')
        .select("*")
        .eq("Priority", "high");

    if (error) {
        console.log("Error fetching high posts:", error.message);
        return;
    }

    const { data: highUsers, error: highUserError } = await client
        .from('users-data')
        .select("*");

    if (highUserError) {
        console.log("Error fetching users:", highUserError.message);
        return;
    }

    const mergedDatahigh = highPost.map(hPost => {
        const user = highUsers.find(u => u.email === hPost.email);
        return {
            ...hPost,
            userName: user?.name,
            userPic: user?.profile_pic
        };
    });

    contentDiv.innerHTML = "";

    mergedDatahigh.forEach(high => {
        const time = new Date(high.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });

        contentDiv.innerHTML += ` 
        <div class="border-info p-2 zoom-card" style="width: 24rem; border:3px solid cyan; border-radius:30px; box-shadow: 0px 0px 15px rgb(196, 249, 255)">
            <!-- TOP PROFILE ROW -->
            <div class="d-flex align-items-center gap-3 p-2">
                <img src="${high.userPic}" alt="profile" style="width:50px; height:50px; border-radius:50%; box-shadow:0px 0px 2px gray; object-fit:cover;">
                <div>
                    <p class="m-0 fw-bold fs-5">${high.userName}</p>
                    <p class="m-0 text-secondary" style="font-size: 14px;">${time}</p>
                </div>
            </div>
            <ul class="list-group list-group-flush">
                <li class="list-group-item fs-2">${high.Title}</li>
                <li class="list-group-item fs-5">${high.Description}</li>
                <li class="list-group-item gap-2 align-items-center d-flex">
                    <div style="width: 20px; height: 20px; background-color: green; border-radius: 50%;"></div> ${high.Priority}
                </li>
            </ul>
            <div class="d-flex gap-2 justify-content-start ms-3 my-2">
               <button class="border-0 bg-info d-flex justify-content-center align-items-center gap-2 
                       text-light fs-5 fw-bold px-3 py-1 rounded-5"
                onClick="editPost(${high.id},'${high.Title}','${high.Description}', '${high.Priority}')">
            Edit 
            <i class="fa-solid fa-pen-to-square fa-sm mb-1" style="color: #ffffff;"></i>
        </button>

        <button class="border-0 bg-info d-flex justify-content-center align-items-center gap-2 
                       text-light fs-5 fw-bold px-3 py-1 rounded-5"
                onClick="deletePost(${high.id})">
            Delete 
            <i class="fa-solid fa-trash fa-xs"></i>
        </button>
            </div>
        </div>`;
    });
});


// =============MEDIUM WORK============

const medBtn = document.getElementById("medBtn");

medBtn && medBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    // Fetch medium priority posts
    const { data: medPost, error } = await client
        .from('user-posts')
        .select("*")
        .eq("Priority", "medium");

    if (error) {
        console.log("Error fetching medium posts:", error.message);
        return;
    }

    // Fetch users data
    const { data: medUsers, error: medUserError } = await client
        .from('users-data')
        .select("*");

    if (medUserError) {
        console.log("Error fetching users:", medUserError.message);
        return;
    }

    // Merge posts with user info
    const mergedDataMed = medPost.map(mPost => {
        const user = medUsers.find(u => u.email === mPost.email);
        return {
            ...mPost,
            userName: user?.name,
            userPic: user?.profile_pic
        };
    });

    contentDiv.innerHTML = "";

    mergedDataMed.forEach(med => {
        const time = new Date(med.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });

        contentDiv.innerHTML += `
        <div class="border-info p-2 zoom-card" style="width: 24rem; border:3px solid cyan; border-radius:30px; box-shadow: 0px 0px 15px rgb(196, 249, 255)">
            <!-- TOP PROFILE ROW -->
            <div class="d-flex align-items-center gap-3 p-2">
                <img src="${med.userPic}" alt="profile" style="width:50px; height:50px; border-radius:50%; box-shadow:0px 0px 2px gray; object-fit:cover;">
                <div>
                    <p class="m-0 fw-bold fs-5">${med.userName}</p>
                    <p class="m-0 text-secondary" style="font-size: 14px;">${time}</p>
                </div>
            </div>

            <ul class="list-group list-group-flush">
                <li class="list-group-item fs-2">${med.Title}</li>
                <li class="list-group-item fs-5">${med.Description}</li>
                <li class="list-group-item gap-2 align-items-center d-flex">
                    <div style="width: 20px; height: 20px; background-color: orange; border-radius: 50%;"></div> ${med.Priority}
                </li>
            </ul>

            <div class="d-flex gap-2 justify-content-start ms-3 my-2">
               <button class="border-0 bg-info d-flex justify-content-center align-items-center gap-2 
                       text-light fs-5 fw-bold px-3 py-1 rounded-5"
                onClick="editPost(${med.id},'${med.Title}','${med.Description}', '${med.Priority}')">
            Edit 
            <i class="fa-solid fa-pen-to-square fa-sm mb-1" style="color: #ffffff;"></i>
        </button>

        <button class="border-0 bg-info d-flex justify-content-center align-items-center gap-2 
                       text-light fs-5 fw-bold px-3 py-1 rounded-5"
                onClick="deletePost(${med.id})">
            Delete 
            <i class="fa-solid fa-trash fa-xs"></i>
        </button>
            </div>
        </div>`;
    });
});

// ========LOW WORK=========

const lowBtn = document.getElementById("lowBtn");

lowBtn && lowBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    // Fetch low priority posts
    const { data: lowPost, error } = await client
        .from('user-posts')
        .select("*")
        .eq("Priority", "low");

    if (error) {
        console.log("Error fetching low posts:", error.message);
        return;
    }

    // Fetch users data
    const { data: lowUsers, error: lowUserError } = await client
        .from('users-data')
        .select("*");

    if (lowUserError) {
        console.log("Error fetching users:", lowUserError.message);
        return;
    }

    // Merge posts with user info
    const mergedDataLow = lowPost.map(lPost => {
        const user = lowUsers.find(u => u.email === lPost.email);
        return {
            ...lPost,
            userName: user?.name,
            userPic: user?.profile_pic
        };
    });

    contentDiv.innerHTML = "";

    mergedDataLow.forEach(low => {
        const time = new Date(low.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });

        contentDiv.innerHTML += `
        <div class="border-info p-2 zoom-card" style="width: 24rem; border:3px solid cyan; border-radius:30px; box-shadow: 0px 0px 15px rgb(196, 249, 255)">
            <!-- TOP PROFILE ROW -->
            <div class="d-flex align-items-center gap-3 p-2">
                <img src="${low.userPic}" alt="profile" style="width:50px; height:50px; border-radius:50%; box-shadow:0px 0px 2px gray; object-fit:cover;">
                <div>
                    <p class="m-0 fw-bold fs-5">${low.userName}</p>
                    <p class="m-0 text-secondary" style="font-size: 14px;">${time}</p>
                </div>
            </div>

            <ul class="list-group list-group-flush">
                <li class="list-group-item fs-2">${low.Title}</li>
                <li class="list-group-item fs-5">${low.Description}</li>
                <li class="list-group-item gap-2 align-items-center d-flex">
                    <div style="width: 20px; height: 20px; background-color: red; border-radius: 50%;"></div> ${low.Priority}
                </li>
            </ul>

            <div class="d-flex gap-2 justify-content-start ms-3 my-2">
                <button class="border-0 bg-info d-flex justify-content-center align-items-center gap-2 
                       text-light fs-5 fw-bold px-3 py-1 rounded-5"
                onClick="editPost(${low.id},'${low.Title}','${low.Description}', '${low.Priority}')">
            Edit 
            <i class="fa-solid fa-pen-to-square fa-sm mb-1" style="color: #ffffff;"></i>
        </button>

        <button class="border-0 bg-info d-flex justify-content-center align-items-center gap-2 
                       text-light fs-5 fw-bold px-3 py-1 rounded-5"
                onClick="deletePost(${low.id})">
            Delete 
            <i class="fa-solid fa-trash fa-xs"></i>
        </button>
            </div>
        </div>`;
    });
});

// =============EDIT POST FUNCTION=============

async function editPost(id, title, description, priority) {
    console.log(title, description, priority);
    let editTitle = prompt("EDIT YOUR TITLE:", title)
    title = editTitle;

    let editDescription = prompt("EDIT YOUR Description:", description)
    description = editDescription;

    let editPriority = prompt("EDIT YOUR priority:", priority)
    priority = editPriority

    const { error } = await client
        .from('user-posts')
        .update({
            Title: editTitle,
            Description: editDescription,
            Priority: editPriority
        })
        .eq("id", id)
    showAllPosts()

    if (error) {
        console.log(error.message, "update Error");
        return;
    }
    alert("update SUCCESSFULLY")


}

// ===========DELETE POST FUNCTION=========


async function deletePost(id) {
    console.log(id);

    if (!confirm("Are you want to delete this post??")) return;

    const response = await client
        .from('user-posts')
        .delete()
        .eq('id', id
        )
    if (response) {
        console.log("delete response", response);
        alert("post delete SuccessFully")

        showAllPosts()

    }



}



// =============STORAGE=============

const imgFile = document.getElementById("imgFile")
const uploadBtn = document.getElementById("uploadBtn")
const imgg = document.getElementById("imgg")
const product_name = document.getElementById("product_name")
const update = document.getElementById("update")


async function showImg() {
    imgg.innerHTML = ""
    const { data: fetchData, error: fetchError } = await client
        .from('storage')
        .select("*")
    if (fetchError) {
        console.log("error in Fetching data", fetchError);
    } else {
        fetchData.forEach((post) => {
            console.log(post);

            imgg.innerHTML += `
        
        <div class="card" style="width: 18rem;">
          <img src="${post.image}" class="card-img-top" alt="...">
          <div class="card-body">
           <p class="card-text">${post.name}</p>
           <button type="button" onClick="editImg(${post.id} , '${post.image}')" class="btn btn-primary">Edit Product</button>
         </div>
        </div>
        
        `
        })
    }

}
window.showImg = showImg


uploadBtn && uploadBtn.addEventListener("click", async (e) => {
    e.preventDefault()
    console.log(product_name.value);

    let file = imgFile.files[0]

    fileName = `${Date.now()}_${file.name}`
    console.log(fileName);

    const { data, error } = await client
        .storage
        .from('profiles')
        .upload(fileName, file)
    if (error) {
        console.log(error, "upload img errror");
    } else {
        alert("img uploaded !")
    }

    const { data: getPublicUrlData } = client
        .storage
        .from('profiles')
        .getPublicUrl(fileName)
    if (getPublicUrlData) {
        console.log(getPublicUrlData, "successfull..........");
        let imgUrl = getPublicUrlData.publicUrl

        const { error } = await client
            .from('storage')
            .insert({ name: product_name.value, image: imgUrl })
        if (error) {
            console.log("error in insert pic", error);
        } else {
            alert("succefully insert table..")

            showImg();
        }


    }
})




function editImg(id, image) {
    update.click()
    window.updateFileName = image.split("/profiles/")[1]
    window.imgId = id


}

update && update.addEventListener("change", async (e) => {
    console.log(e.target.files[0]);

    console.log(updateFileName, imgId);
    const { data, error } = await client
        .storage
        .from('profiles')
        .remove([updateFileName])
    if (error) {
        console.log(error, "error in removing file");
    } else {
        console.log(data, "REMOVE successfully!");

        const newFile = e.target.files[0]
        const newFileName = e.target.files[0].name
        const { data: uploadData, error: uploadError } = await client
            .storage
            .from('profiles')
            .upload(newFileName, newFile, {
                upsert: true
            })
        if (uploadError) {
            console.log("error in uploading", uploadError);
        } else {
            console.log(uploadData);
            let fileData = uploadData.fullPath.split("/")[1]
            let newUrl = fileData
            console.log(newUrl);

            const { data: newData } = client
                .storage
                .from('profiles')
                .getPublicUrl(newUrl)

            if (newData) {
                console.log(newData.publicUrl);
                let newPublicUrl = newData.publicUrl

                const { error } = await client
                    .from('storage')
                    .update({ image: newPublicUrl })
                    .eq('id', imgId)

                if (error) {
                    console.log(error, "error in inserting again...");

                }

            }
            showImg();

        }


    }



})