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

// Abre a câmera frontal solicitando alta resolução
async function abrirCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: {
          ideal: "user"
        },

        width: {
          ideal: 1920
        },

        height: {
          ideal: 1080
        },

        frameRate: {
          ideal: 30
        }
      },

      audio: false
    });

    camera.srcObject = stream;

    await camera.play();

    console.log(
      "Resolução da câmera:",
      camera.videoWidth,
      "x",
      camera.videoHeight
    );

  } catch (erro) {

    console.error(
      "Erro ao abrir a câmera:",
      erro
    );

    alert(
      "Não foi possível abrir a câmera. " +
      "Verifique se você permitiu o acesso à câmera."
    );
  }
}

// Captura a foto em 1080 x 1920
capturar.addEventListener("click", () => {

  if (
    !camera.videoWidth ||
    !camera.videoHeight
  ) {
    alert(
      "A câmera ainda está carregando. " +
      "Aguarde alguns segundos."
    );

    return;
  }

  // Tamanho final fixo
  const larguraFinal = 1080;
  const alturaFinal = 1920;

  canvas.width = larguraFinal;
  canvas.height = alturaFinal;

  const contexto = canvas.getContext("2d", {
    alpha: false
  });

  // Qualidade máxima de redimensionamento
  contexto.imageSmoothingEnabled = true;

  contexto.imageSmoothingQuality = "high";

  // Fundo preto
  contexto.fillStyle = "#000";

  contexto.fillRect(
    0,
    0,
    larguraFinal,
    alturaFinal
  );

  const larguraVideo = camera.videoWidth;

  const alturaVideo = camera.videoHeight;

  // Proporção do resultado: 9:16
  const proporcaoFinal =
    larguraFinal / alturaFinal;

  // Proporção original da câmera
  const proporcaoVideo =
    larguraVideo / alturaVideo;

  let larguraRecorte;
  let alturaRecorte;

  let origemX;
  let origemY;

  // Faz um recorte central sem deformar
  if (
    proporcaoVideo >
    proporcaoFinal
  ) {

    // Vídeo mais largo:
    // corta as laterais
    alturaRecorte =
      alturaVideo;

    larguraRecorte =
      alturaVideo *
      proporcaoFinal;

    origemX =
      (
        larguraVideo -
        larguraRecorte
      ) / 2;

    origemY = 0;

  } else {

    // Vídeo mais alto:
    // corta parte de cima e de baixo
    larguraRecorte =
      larguraVideo;

    alturaRecorte =
      larguraVideo /
      proporcaoFinal;

    origemX = 0;

    origemY =
      (
        alturaVideo -
        alturaRecorte
      ) / 2;

  }

  // Espelha a imagem para ficar igual
  // à visualização da câmera
  contexto.save();

  contexto.translate(
    larguraFinal,
    0
  );

  contexto.scale(
    -1,
    1
  );

  contexto.drawImage(
    camera,

    origemX,
    origemY,

    larguraRecorte,
    alturaRecorte,

    0,
    0,

    larguraFinal,
    alturaFinal
  );

  contexto.restore();

  // Aplica a moldura
  contexto.drawImage(
    moldura,

    0,
    0,

    larguraFinal,
    alturaFinal
  );

  // Gera PNG sem compressão com perda
  canvas.toBlob(
    (blob) => {

      if (!blob) {

        alert(
          "Não foi possível gerar a foto."
        );

        return;
      }

      fotoBlob = blob;

      fotoUrl =
        URL.createObjectURL(blob);

      fotoResultado.src =
        fotoUrl;

      // Mostra a foto final
      fotoResultado
        .classList
        .remove("escondido");

      // Esconde a câmera
      camera
        .classList
        .add("escondido");

      // Esconde a moldura da prévia
      moldura
        .classList
        .add("escondido");

      // Esconde o botão circular
      controleCamera
        .classList
        .add("escondido");

      // Mostra as ações
      acoes
        .classList
        .remove("escondido");

    },

    "image/png"
  );

});

// Abre o compartilhamento do iPhone
// para permitir "Salvar Imagem"
salvar.addEventListener(
  "click",
  async () => {

    if (!fotoBlob) return;

    const arquivo =
      new File(
        [fotoBlob],

        "foto-50-anos.png",

        {
          type: "image/png"
        }
      );

    try {

      // No iPhone, abre o menu nativo
      // de compartilhamento
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [arquivo]
        })
      ) {

        await navigator.share({

          title:
            "Foto dos 50 anos",

          text:
            "Minha foto da festa! ✨",

          files:
            [arquivo]

        });

      } else {

        // Alternativa para navegadores
        // que não suportam compartilhar
        const url =
          URL.createObjectURL(
            fotoBlob
          );

        const link =
          document.createElement("a");

        link.href = url;

        link.download =
          "foto-50-anos.png";

        document.body
          .appendChild(link);

        link.click();

        link.remove();

        setTimeout(
          () => {

            URL.revokeObjectURL(
              url
            );

          },

          1500
        );

      }

    } catch (erro) {

      // Não mostra erro se a pessoa
      // apenas fechar o menu
      if (
        erro.name !==
        "AbortError"
      ) {

        console.error(
          "Erro ao compartilhar:",
          erro
        );

      }

    }

  }
);

// Volta para a câmera
novaFoto.addEventListener(
  "click",
  () => {

    if (fotoUrl) {

      URL.revokeObjectURL(
        fotoUrl
      );

      fotoUrl = null;

    }

    fotoResultado.src = "";

    fotoResultado
      .classList
      .add("escondido");

    camera
      .classList
      .remove("escondido");

    moldura
      .classList
      .remove("escondido");

    controleCamera
      .classList
      .remove("escondido");

    acoes
      .classList
      .add("escondido");

    fotoBlob = null;

  }
);

// Inicia a câmera
abrirCamera();
