const camera = document.getElementById("camera");
const moldura = document.getElementById("moldura");
const fotoResultado = document.getElementById("fotoResultado");

const capturar = document.getElementById("capturar");
const controleCamera = document.getElementById("controleCamera");

const acoes = document.getElementById("acoes");
const salvar = document.getElementById("salvar");
const novaFoto = document.getElementById("novaFoto");

const canvas = document.getElementById("canvas");

let stream;
let fotoUrl;
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
      "Verifique se você permitiu o acesso à câmera."
    );
  }
}

// Tira a foto
capturar.addEventListener("click", () => {

  const largura = camera.videoWidth;
  const altura = camera.videoHeight;

  if (!largura || !altura) {
    alert("A câmera ainda está carregando. Tente novamente.");
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

  // Coloca a moldura sobre a foto
  contexto.drawImage(
    moldura,
    0,
    0,
    largura,
    altura
  );

  canvas.toBlob((blob) => {

    fotoFinal = blob;

    fotoUrl = URL.createObjectURL(blob);

    fotoResultado.src = fotoUrl;

    fotoResultado.hidden = false;

    // Esconde câmera e moldura da prévia
    camera.style.display = "none";

    moldura.style.display = "none";

    // Esconde o botão circular
    controleCamera.hidden = true;

    // Mostra as opções
    acoes.hidden = false;

  }, "image/png");

});

// Salva a imagem
salvar.addEventListener("click", () => {

  if (!fotoFinal) return;

  const link = document.createElement("a");

  link.href = URL.createObjectURL(fotoFinal);

  link.download = "foto-50-anos.png";

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(link.href);
  }, 1000);

});

// Tira outra foto
novaFoto.addEventListener("click", () => {

  if (fotoUrl) {
    URL.revokeObjectURL(fotoUrl);
  }

  fotoResultado.src = "";

  fotoResultado.hidden = true;

  camera.style.display = "block";

  moldura.style.display = "block";

  controleCamera.hidden = false;

  acoes.hidden = true;

});

// Inicia a câmera
abrirCamera();
