import { initializeApp } from "https://gstatic.com";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://gstatic.com";

// Suas credenciais oficiais do Blueberry
const firebaseConfig = {
  apiKey: "AIzaSyBbcnTj1PxAclN0E0Fc9GlDI_MhCS0hP7Y",
  authDomain: "://firebaseapp.com",
  projectId: "blueberry-c6d6f",
  storageBucket: "blueberry-c6d6f.firebasestorage.app",
  messagingSenderId: "907567492761",
  appId: "1:907567492761:web:6c9ee873357ceb68b25208"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const btnPublish = document.getElementById('btn-publish');
const postText = document.getElementById('post-text');
const videoLinkInput = document.getElementById('video-link-input');
const feed = document.getElementById('feed');

// Enviar postagem (Texto e Link de Vídeo)
btnPublish.addEventListener('click', async () => {
    const textValue = postText.value.trim();
    const videoUrl = videoLinkInput.value.trim();

    if (textValue || videoUrl) {
        try {
            await addDoc(collection(db, "posts"), {
                text: textValue,
                video: videoUrl,
                createdAt: Date.now()
            });
            
            // Limpa os campos após o envio concluído
            postText.value = "";
            videoLinkInput.value = "";
        } catch (error) {
            alert("Erro ao salvar publicação: " + error.message);
        }
    }
});

// Atualiza a linha do tempo em tempo real para todos os usuários
const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
    feed.innerHTML = "";
    snapshot.forEach((doc) => {
        const post = doc.data();
        const card = document.createElement('div');
        card.className = 'post-card';
        
        let videoHTML = "";
        
        // Verifica se há um link de vídeo e cria a tag certa
        if (post.video) {
            if (post.video.includes("youtube.com") || post.video.includes("youtu.be")) {
                // Se for link do YouTube, converte para formato de incorporar (embed)
                let videoId = post.video.split("v=")[1] || post.video.split("/").pop();
                if(videoId.includes("&")) videoId = videoId.split("&")[0];
                videoHTML = `<iframe width="100%" height="315" src="https://youtube.com{videoId}" frameborder="0" allowfullscreen style="border-radius:8px; margin-top:10px;"></iframe>`;
            } else {
                // Se for um link direto de arquivo de vídeo (.mp4, etc)
                videoHTML = `<video src="${post.video}" controls style="width:100%; border-radius:8px; margin-top:10px;"></video>`;
            }
        }
        
        card.innerHTML = `
            <p style="margin:0; font-size:16px;">${post.text}</p>
            ${videoHTML}
        `;
        feed.appendChild(card);
    });
});
