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

// Abre a câmera frontal
async function abrirCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: {
          ideal: 1920
        },
        height: {
          ideal: 1080
        }
      },
      audio: false
    });

    camera.srcObject = stream;

    await new Promise((resolve) => {
      camera.onloadedmetadata = resolve;
    });

    await camera.play();

  } catch (erro) {
    console.error("Erro ao abrir a câmera:", erro);

    alert(
      "Não foi possível abrir a câmera. " +
      "Verifique se você permitiu o acesso."
    );
  }
}

// Captura a foto
capturar.addEventListener("click", async () => {

  // Garante que a câmera está pronta
  if (
    camera.readyState < 2 ||
    camera.videoWidth === 0 ||
    camera.videoHeight === 0
  ) {
    alert(
      "A câmera ainda está carregando. " +
      "Aguarde alguns segundos."
    );

    return;
  }

  // Resultado final: Story 1080 x 1920
  const larguraFinal = 1080;
  const alturaFinal = 1920;

  canvas.width = larguraFinal;
  canvas.height = alturaFinal;

  const contexto = canvas.getContext("2d");

  contexto.imageSmoothingEnabled = true;
  contexto.imageSmoothingQuality = "high";

  // Dimensões reais do vídeo
  const larguraVideo = camera.videoWidth;
  const alturaVideo = camera.videoHeight;

  // Calcula um recorte 9:16 sem deformar
  const proporcaoFinal =
    larguraFinal / alturaFinal;

  const proporcaoVideo =
    larguraVideo / alturaVideo;

  let origemX = 0;
  let origemY = 0;

  let larguraRecorte = larguraVideo;
  let alturaRecorte = alturaVideo;

  if (proporcaoVideo > proporcaoFinal) {

    // Vídeo mais largo:
    // corta as laterais
    larguraRecorte =
      alturaVideo * proporcaoFinal;

    origemX =
      (larguraVideo - larguraRecorte) / 2;

  } else {

    // Vídeo mais alto:
    // corta em cima e embaixo
    alturaRecorte =
      larguraVideo / proporcaoFinal;

    origemY =
      (alturaVideo - alturaRecorte) / 2;

  }

  // Desenha o vídeo espelhado
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

  // Espera a moldura estar carregada
  if (!moldura.complete) {
    await new Promise((resolve) => {
      moldura.onload = resolve;
    });
  }

  // Aplica a moldura
  contexto.drawImage(
    moldura,
    0,
    0,
    larguraFinal,
    alturaFinal
  );

  // Gera a imagem
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

      fotoResultado.onload = () => {

        // Só troca para a foto
        // depois que ela carregou
        fotoResultado
          .classList
          .remove("escondido");

        camera
          .classList
          .add("escondido");

        moldura
          .classList
          .add("escondido");

        controleCamera
          .classList
          .add("escondido");

        // Mostra os botões
        acoes
          .classList
          .add("ativo");

      };

    },

    "image/png"
  );

});

// Salvar no celular
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
          files:
            [arquivo]
        });

      } else {

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
            URL.revokeObjectURL(url);
          },
          1000
        );

      }

    } catch (erro) {

      if (
        erro.name !==
        "AbortError"
      ) {
        console.error(
          erro
        );
      }

    }

  }
);

// Tirar outra foto
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
      .remove("ativo");

    fotoBlob = null;

  }
);

// Inicia a câmera
abrirCamera();
