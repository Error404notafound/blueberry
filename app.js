import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://gstatic.com";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://gstatic.com";

const firebaseConfig = {
  apiKey: "AIzaSyBbcnTj1PxAclN0E0Fc9GlDI_MhCS0hP7Y",
  authDomain: "blueberry-c6d6f.firebaseapp.com",
  projectId: "blueberry-c6d6f",
  storageBucket: "blueberry-c6d6f.firebasestorage.app",
  messagingSenderId: "907567492761",
  appId: "1:907567492761:web:6c9ee873357ceb68b25208"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Forçar ativação imediata dos botões na tela
document.addEventListener("DOMContentLoaded", () => {
    console.log("Blueberry carregado!");
});

const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');

onAuthStateChanged(auth, (user) => {
    if (user) {
        authContainer.style.display = 'none';
        appContainer.style.display = 'block';
        carregarFeed();
    } else {
        authContainer.style.display = 'block';
        appContainer.style.display = 'none';
    }
});

// Clique Criar Conta
document.getElementById('btn-register').addEventListener('click', () => {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    
    if(!email || !password) {
        alert("Preencha o e-mail e a senha antes!");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then(() => alert("Conta criada com sucesso!"))
        .catch(error => alert("Erro: " + error.message));
});

// Clique Entrar
document.getElementById('btn-login').addEventListener('click', () => {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();

    if(!email || !password) {
        alert("Preencha o e-mail e a senha antes!");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then(() => alert("Entrou!"))
        .catch(error => alert("Erro: " + error.message));
});

document.getElementById('btn-logout').addEventListener('click', () => signOut(auth));

document.getElementById('btn-publish').addEventListener('click', async () => {
    const textValue = document.getElementById('post-text').value.trim();
    const videoUrl = document.getElementById('video-link-input').value.trim();

    if (textValue || videoUrl) {
        try {
            await addDoc(collection(db, "posts"), {
                text: textValue,
                video: videoUrl,
                autor: auth.currentUser.email,
                createdAt: Date.now()
            });
            document.getElementById('post-text').value = "";
            document.getElementById('video-link-input').value = "";
        } catch (error) {
            alert("Erro ao postar: " + error.message);
        }
    }
});

function carregarFeed() {
    const feed = document.getElementById('feed');
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        feed.innerHTML = "";
        snapshot.forEach((doc) => {
            const post = doc.data();
            const card = document.createElement('div');
            card.className = 'post-card';
            
            let videoHTML = "";
            if (post.video) {
                if (post.video.includes("youtube.com") || post.video.includes("youtu.be")) {
                    let videoId = post.video.split("v=") || post.video.split("/").pop();
                    if(videoId.includes("&")) videoId = videoId.split("&");
                    videoHTML = `<iframe width="100%" height="200" src="https://youtube.com{videoId}" frameborder="0" allowfullscreen style="border-radius:8px; margin-top:10px;"></iframe>`;
                } else {
                    videoHTML = `<video src="${post.video}" controls style="width:100%; border-radius:8px; margin-top:10px;"></video>`;
                }
            }
            
            card.innerHTML = `
                <small style="color:var(--accent-blue); font-weight:bold;">${post.autor || 'Anônimo'}</small>
                <p style="margin:5px 0 0 0; font-size:16px;">${post.text}</p>
                ${videoHTML}
            `;
            feed.appendChild(card);
        });
    });
}
