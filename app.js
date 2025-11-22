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
const phoneNo = document.getElementById("phoneNo")
const btn = document.getElementById("btn")
btn && btn.addEventListener("click", async () => {
    try {
        if (!username.value || !email.value || !password.value || !phoneNo.value) {
            alert("Plaease enter All Fields!")
        } else {

            const { data, error } = await client.auth.signUp({
                email: email.value,
                password: password.value,
                options: {
                    data: {
                        username: username.value,
                        phoneNo: phoneNo.value
                    }
                }
            })

            if (data) {
                console.log(data.user.user_metadata);
                userinfo = data.user.user_metadata
                let { username, email, phoneNo } = userinfo

                const { error } = await client
                    .from('users-data')
                    .insert({ name: username, email: email, phoneNo: phoneNo })

                if (error) {
                    console.log("USER DATA ERROR", error);
                }else{
                    alert("DATA INSERT SUCCESSFULLY")
                }
            }

            if(data) {
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
            else{
                console.log(error,error.message);
                
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
            alert("redirect to Home page...")


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
        alert("Logout Successfully")
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

    const { error } = await client
        .from('user-posts')
        .insert({
            Title: title.value,
            Description: description.value,
            Priority: selectedInp.value
        })

    if (error) {
        console.log(error, error.message);
    } else {
        alert("DATA INSERT SUCCESSFULLY!!")
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
        const { data, error } = await client
            .from('user-posts')
            .select("*")

        if (error) {
            console.log(error, error.message);
        }

        contentDiv.innerHTML = ""

        data.forEach(allPost => {
            console.log(allPost);

            if (allPost.Priority == 'high') {
                color = 'green'
            } else if (allPost.Priority == 'low') {
                color = 'red'
            } else {
                color = 'orange'
            }
            // const time = new Date(allPost.created_at).toLocaleString()
            contentDiv.innerHTML += ` 
        <div class="border-info p-2" style="width: 24rem; border:3px solid cyan; border-radius:30px; box-shadow: 0px 0px 15px  rgb(196, 249, 255)">
        <ul class="list-group list-group-flush">
        <li class="list-group-item fs-2">${allPost.Title}</li>
        <li class="list-group-item fs-5">${allPost.Description}</li>
        <li class="list-group-item  gap-2 align-items-center d-flex"><div style="width: 20px; height: 20px; background-color: ${color}; border: none; border-radius: 50%; "></div> ${allPost.Priority}</li>    
        </ul>
        <div class="d-flex gap-2 justify-content-start ms-3 my-2">
        <button class="border-0 bg-info d-flex justify-content-center align-items-center gap-2 text-light fs-5 fw-bold px-3 py-1 rounded-5" onClick="editPost(${allPost.id},'${allPost.Title}','${allPost.Description}', '${allPost.Priority}')">Edit <i class="fa-solid fa-pen-to-square fa-sm mb-1" style="color: #ffffff;"></i></button>
        <button class="border-0 bg-info d-flex justify-content-center align-items-center gap-2 text-light fs-5 fw-bold px-3 py-1 rounded-5" onClick="deletePost(${allPost.id})">Delete <i class="fa-solid fa-trash fa-xs"></i></button>
        </div>
        </div>`
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

const highBtn = document.getElementById("highBtn")

highBtn && highBtn.addEventListener("click", async (e) => {
    e.preventDefault()
    const { data, error } = await client
        .from('user-posts')
        .select("*")
        .eq("Priority", "high")

    if (error) {
        console.log(error, error.message);
    }

    contentDiv.innerHTML = ""

    data.forEach(high => {
        console.log(high);
        contentDiv.innerHTML += ` 
      <div class="border-info p-2" style="width: 24rem; border:3px solid cyan; border-radius:30px; box-shadow: 0px 0px 15px  rgb(196, 249, 255)">
        <ul class="list-group list-group-flush">
        <li class="list-group-item fs-2">${high.Title}</li>
        <li class="list-group-item fs-5">${high.Description}</li>
       <li class="list-group-item gap-2 align-items-center d-flex"><div style="width: 20px; height: 20px; background-color: green; border: none; border-radius: 50%; "></div> ${high.Priority}</li>
        </ul>
         <div class="d-flex gap-2 justify-content-start ms-3 my-2">
        <button class="border-0 bg-info d-flex justify-content-center align-items-center gap-2 text-light fs-5 fw-bold px-3 py-1 rounded-5">Edit <i class="fa-solid fa-pen-to-square fa-sm mb-1" style="color: #ffffff;"></i></button>
        <button class="border-0 bg-info d-flex justify-content-center align-items-center gap-2 text-light fs-5 fw-bold px-3 py-1 rounded-5">Delete <i class="fa-solid fa-trash fa-xs"></i></button>
        </div>
        </div>`
    });

})

// =============MEDIUM WORK============


const medBtn = document.getElementById("medBtn")

medBtn && medBtn.addEventListener("click", async (e) => {
    e.preventDefault()
    const { data, error } = await client
        .from('user-posts')
        .select("*")
        .eq("Priority", "medium")

    if (error) {
        console.log(error, error.message);
    }

    contentDiv.innerHTML = ""

    data.forEach(medium => {
        console.log(medium);
        contentDiv.innerHTML += ` 
       <div class="border-info p-2" style="width: 24rem; border:3px solid cyan; border-radius:30px; box-shadow: 0px 0px 15px  rgb(196, 249, 255)">
        <ul class="list-group list-group-flush">
        <li class="list-group-item fs-2">${medium.Title}</li>
        <li class="list-group-item fs-4">${medium.Description}</li>
        <li class="list-group-item gap-2 align-items-center d-flex"><div style="width: 20px; height: 20px; background-color: orange; border: none; border-radius: 50%; "></div> ${medium.Priority}</li>
        </ul>
         <div class="d-flex gap-2 justify-content-start ms-3 my-2">
        <button class="border-0 bg-info d-flex justify-content-center align-items-center gap-2 text-light fs-5 fw-bold px-3 py-1 rounded-5">Edit <i class="fa-solid fa-pen-to-square fa-sm mb-1" style="color: #ffffff;"></i></button>
        <button class="border-0 bg-info d-flex justify-content-center align-items-center gap-2 text-light fs-5 fw-bold px-3 py-1 rounded-5">Delete <i class="fa-solid fa-trash fa-xs"></i></button>
        </div>
        </div>`
    });

})


// ========LOW WORK=========


const lowBtn = document.getElementById("lowBtn")

lowBtn && lowBtn.addEventListener("click", async (e) => {
    e.preventDefault()
    const { data, error } = await client
        .from('user-posts')
        .select("*")
        .eq("Priority", "low")

    if (error) {
        console.log(error, error.message);
    }

    contentDiv.innerHTML = ""

    data.forEach(low => {
        console.log(low);
        contentDiv.innerHTML += ` 
      <div class="border-info p-2" style="width: 24rem; border:3px solid cyan; border-radius:30px; box-shadow: 0px 0px 15px  rgb(196, 249, 255)">
        <ul class="list-group list-group-flush">
        <li class="list-group-item fs-2">${low.Title}</li>
        <li class="list-group-item fs-4">${low.Description}</li>
        <li class="list-group-item gap-2 align-items-center d-flex"><div style="width: 20px; height: 20px; background-color: red; border: none; border-radius: 50%; "></div> ${low.Priority}</li>
        </ul>
         <div class="d-flex gap-2 justify-content-start ms-3 my-2">
        <button class="border-0 bg-info d-flex justify-content-center align-items-center gap-2 text-light fs-5 fw-bold px-3 py-1 rounded-5">Edit <i class="fa-solid fa-pen-to-square fa-sm mb-1" style="color: #ffffff;"></i></button>
        <button class="border-0 bg-info d-flex justify-content-center align-items-center gap-2 text-light fs-5 fw-bold px-3 py-1 rounded-5">Delete <i class="fa-solid fa-trash fa-xs"></i></button>
        </div>
        </div>`
    });

})

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

