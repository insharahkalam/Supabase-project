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
const btn = document.getElementById("btn")

btn && btn.addEventListener("click", async () => {

    try {
        if (!username || !email || !password) {
            alert("Plaease enter All Fields!")
        }
        const { data, error } = await client.auth.signUp({
            email: email.value,
            password: password.value,
            options: {
                data: {
                    username: username.value
                }
            }
        })

        if (error) {
            alert("signup failed!")
            console.log(error.message);
        }
        else {
            console.log(data);
            alert("redirect to login page...")
            window.location.href = "login.html"
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
        if (!loginEmail || !loginPassword) {
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
            window.location.href = "createPost.html"
        }
    } catch (error) {
        console.log(error);
    }
})

// ===============GET USER DATA============

async function getUserData() {

    const showUserName = document.getElementById("showUserName")
    const { data, error } = await client.auth.getUser()
    console.log(data, "user data");
    showUserName.innerHTML = data.user.user_metadata.username
    if (error) {
        console.log(error, error.message);

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
            // const time = new Date(allPost.created_at).toLocaleString()
            contentDiv.innerHTML += ` 
        <div class="border-info p-2" style="width: 24rem; border:3px solid cyan; border-radius:30px; box-shadow: 0px 0px 15px  rgb(196, 249, 255)">
        <ul class="list-group list-group-flush">
        <li class="list-group-item fs-2">${allPost.Title}</li>
        <li class="list-group-item fs-5">${allPost.Description}</li>
        <li class="list-group-item">${allPost.Priority}</li>
       
        
        </ul>
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
        </div>`
    });

})