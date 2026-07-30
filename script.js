const camera = document.getElementById("camera");
const moldura = document.getElementById("moldura");
const fotoResultado = document.getElementById("fotoResultado");

const capturar = document.getElementById("capturar");
const controleCamera = document.getElementById("controleCamera");

const acoes = document.getElementById("acoes");
const salvar = document.getElementById("salvar");
const novaFoto = document.getElementById("novaFoto");

const canvas = document.getElementById("canvas");

let fotoBlob = null;
let fotoUrl = null;

// Abre a câmera frontal automaticamente
async function abrirCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: {
          ideal: "user"
        }
      },
      audio: false
    });

    camera.srcObject = stream;

    await camera.play();

  } catch (erro) {
    console.error("Erro ao abrir a câmera:", erro);

    alert(
      "Não foi possível abrir a câmera. " +
      "Verifique se você permitiu o acesso à câmera."
    );
  }
}

// Captura a foto
capturar.addEventListener("click", () => {

  if (
    !camera.videoWidth ||
    !camera.videoHeight
  ) {
    alert("A câmera ainda está carregando. Aguarde alguns segundos.");
    return;
  }

  const largura = camera.videoWidth;
  const altura = camera.videoHeight;

  canvas.width = largura;
  canvas.height = altura;

  const contexto = canvas.getContext("2d");

  // Espelha a foto para ficar igual à câmera
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

  // Coloca a moldura sobre a foto
  contexto.drawImage(
    moldura,
    0,
    0,
    largura,
    altura
  );

  canvas.toBlob((blob) => {

    if (!blob) {
      alert("Não foi possível gerar a foto.");
      return;
    }

    fotoBlob = blob;

    fotoUrl = URL.createObjectURL(blob);

    fotoResultado.src = fotoUrl;

    // Mostra a foto pronta
    fotoResultado.classList.remove("escondido");

    // Esconde câmera e moldura
    camera.classList.add("escondido");

    moldura.classList.add("escondido");

    // Troca os controles
    controleCamera.classList.add("escondido");

    acoes.classList.remove("escondido");

  }, "image/png");

});

// Salva a foto
salvar.addEventListener("click", () => {

  if (!fotoBlob) return;

  const url = URL.createObjectURL(fotoBlob);

  const link = document.createElement("a");

  link.href = url;

  link.download = "foto-50-anos.png";

  document.body.appendChild(link);

  link.click();

  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1500);

});

// Volta para a câmera
novaFoto.addEventListener("click", () => {

  if (fotoUrl) {
    URL.revokeObjectURL(fotoUrl);

    fotoUrl = null;
  }

  fotoResultado.src = "";

  fotoResultado.classList.add("escondido");

  camera.classList.remove("escondido");

  moldura.classList.remove("escondido");

  controleCamera.classList.remove("escondido");

  acoes.classList.add("escondido");

  fotoBlob = null;

});

// Inicia a câmera
abrirCamera();
