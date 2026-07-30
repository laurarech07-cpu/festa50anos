const camera = document.getElementById("camera");
const moldura = document.getElementById("moldura");
const capturar = document.getElementById("capturar");
const acoes = document.getElementById("acoes");
const compartilhar = document.getElementById("compartilhar");
const novaFoto = document.getElementById("novaFoto");
const canvas = document.getElementById("canvas");

let stream;
let fotoFinal;

// Abre automaticamente a câmera frontal
async function abrirCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user"
      },
      audio: false
    });

    camera.srcObject = stream;

  } catch (erro) {
    console.error("Erro ao abrir a câmera:", erro);

    alert(
      "Não foi possível acessar a câmera. " +
      "Verifique se você permitiu o acesso à câmera no navegador."
    );
  }
}

// Captura a foto e aplica a moldura
capturar.addEventListener("click", () => {

  const largura = camera.videoWidth;
  const altura = camera.videoHeight;

  if (!largura || !altura) {
    alert("A câmera ainda está carregando. Tente novamente em alguns segundos.");
    return;
  }

  canvas.width = largura;
  canvas.height = altura;

  const contexto = canvas.getContext("2d");

  // Espelha a foto para ficar igual à prévia
  contexto.save();

  contexto.translate(largura, 0);
  contexto.scale(-1, 1);

  contexto.drawImage(
    camera,
    0,
    0,
    largura,
    altura
  );

  contexto.restore();

  // Coloca a moldura por cima
  contexto.drawImage(
    moldura,
    0,
    0,
    largura,
    altura
  );

  // Cria a imagem final
  canvas.toBlob((blob) => {

    fotoFinal = new File(
      [blob],
      "foto-50-anos.png",
      {
        type: "image/png"
      }
    );

    // Mostra a foto capturada na própria tela
    const imagem = document.createElement("img");

    imagem.src = URL.createObjectURL(blob);
    imagem.id = "fotoResultado";

    document
      .querySelector(".camera-area")
      .replaceChildren(imagem);

    // Esconde o botão de captura
    capturar.hidden = true;

    // Mostra os botões de ação
    acoes.hidden = false;

  }, "image/png");

});

// Compartilha a foto usando o menu do celular
compartilhar.addEventListener("click", async () => {

  if (!fotoFinal) return;

  try {

    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({
        files: [fotoFinal]
      })
    ) {

      await navigator.share({
        title: "50 anos",
        text: "Registre esse momento especial! ✨",
        files: [fotoFinal]
      });

    } else {

      // Caso o celular não suporte compartilhamento direto,
      // faz o download da foto
      const link = document.createElement("a");

      link.href = URL.createObjectURL(fotoFinal);
      link.download = "foto-50-anos.png";

      link.click();

      URL.revokeObjectURL(link.href);

      alert(
        "A foto foi salva. Agora você pode publicá-la no Instagram."
      );
    }

  } catch (erro) {

    // O usuário pode simplesmente fechar a tela de compartilhamento
    if (erro.name !== "AbortError") {
      console.error("Erro ao compartilhar:", erro);
    }

  }

});

// Volta para a câmera
novaFoto.addEventListener("click", () => {

  const areaCamera = document.querySelector(".camera-area");

  areaCamera.innerHTML = `
    <video
      id="camera"
      autoplay
      playsinline>
    </video>

    <img
      id="moldura"
      src="moldura.png"
      alt="Moldura da festa">
  `;

  location.reload();

});

// Inicia a câmera ao abrir a página
abrirCamera();
