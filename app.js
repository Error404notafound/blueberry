import { initializeApp } from "https://gstatic.com";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://gstatic.com";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://gstatic.com";

// Suas credenciais oficiais do Blueberry
const firebaseConfig = {
  apiKey: "AIzaSyBbcnTj1PxAclN0E0Fc9GlDI_MhCS0hP7Y",
  authDomain: "blueberry-c6d6f.firebaseapp.com",
  projectId: "blueberry-c6d6f",
  storageBucket: "blueberry-c6d6f.firebasestorage.app",
  messagingSenderId: "907567492761",
  appId: "1:907567492761:web:6c9ee873357ceb68b25208"
};

// Inicializa as ferramentas
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const btnPublish = document.getElementById('btn-publish');
const postText = document.getElementById('post-text');
const videoInput = document.getElementById('video-input');
const feed = document.getElementById('feed');

// Enviar postagem (Texto e Vídeo)
btnPublish.addEventListener('click', async () => {
    let videoUrl = "";
    const file = videoInput.files[0]; // Pega o primeiro arquivo selecionado

    // Se o usuário colocou um vídeo
    if (file) {
        btnPublish.innerText = "Enviando vídeo...";
        btnPublish.disabled = true;
        
        try {
            const storageRef = ref(storage, `videos/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            videoUrl = await getDownloadURL(snapshot.ref);
        } catch (error) {
            alert("Erro ao enviar vídeo: " + error.message);
            btnPublish.innerText = "Publicar";
            btnPublish.disabled = false;
            return;
        }
    }

    // Se tiver texto ou vídeo, salva na linha do tempo
    if (postText.value || videoUrl) {
        try {
            await addDoc(collection(db, "posts"), {
                text: postText.value,
                video: videoUrl,
                createdAt: Date.now()
            });
            
            // Limpa tudo após o envio concluído
            postText.value = "";
            videoInput.value = "";
        } catch (error) {
            alert("Erro ao salvar publicação: " + error.message);
        }
        
        btnPublish.innerText = "Publicar";
        btnPublish.disabled = false;
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
        
        let videoHTML = post.video ? `<video src="${post.video}" controls></video>` : '';
        
        card.innerHTML = `
            <p>${post.text}</p>
            ${videoHTML}
        `;
        feed.appendChild(card);
    });
});
