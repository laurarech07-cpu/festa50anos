const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const botao = document.getElementById("tirarFoto");
const baixar = document.getElementById("baixar");
const moldura = document.getElementById("moldura");


// Abrir câmera
navigator.mediaDevices.getUserMedia({
    video: {
        facingMode: "user"
    },
    audio: false
})
.then(stream => {
    video.srcObject = stream;
})
.catch(error => {
    alert("Não foi possível acessar a câmera.");
    console.log(error);
});


// Tirar foto
botao.addEventListener("click", () => {

    const largura = video.videoWidth;
    const altura = video.videoHeight;

    canvas.width = largura;
    canvas.height = altura;

    const contexto = canvas.getContext("2d");


    // Desenha a câmera
    contexto.drawImage(
        video,
        0,
        0,
        largura,
        altura
    );


    // Desenha a moldura por cima
    contexto.drawImage(
        moldura,
        0,
        0,
        largura,
        altura
    );


    // Cria imagem final
    const foto = canvas.toDataURL("image/png");


    // Mostra botão de baixar
    baixar.style.display = "block";

    baixar.href = foto;
    baixar.download = "foto-festa-50-anos.png";

    baixar.innerHTML = "💾 Baixar foto";

});
