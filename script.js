const camera = document.getElementById("camera");
const moldura = document.getElementById("moldura");
const fotoResultado = document.getElementById("fotoResultado");

const capturar = document.getElementById("capturar");
const controleCamera = document.getElementById("controleCamera");

const acoes = document.getElementById("acoes");
const salvar = document.getElementById("salvar");
const novaFoto = document.getElementById("novaFoto");

const canvas = document.getElementById("canvas");

let stream = null;
let fotoBlob = null;
let fotoUrl = null;


/* ABRIR CÂMERA */

async function abrirCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: {
          ideal: "user"
        },

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

    await camera.play();

  } catch (erro) {
    console.error("Erro ao abrir a câmera:", erro);

    alert(
      "Não foi possível abrir a câmera. Verifique se você permitiu o acesso."
    );
  }
}


/* TIRAR FOTO */

capturar.addEventListener("click", async () => {

  if (
    camera.readyState < 2 ||
    camera.videoWidth === 0 ||
    camera.videoHeight === 0
  ) {
    alert("A câmera ainda está carregando. Aguarde alguns segundos.");
    return;
  }

  const larguraFinal = 1080;
  const alturaFinal = 1920;

  canvas.width = larguraFinal;
  canvas.height = alturaFinal;

  const contexto = canvas.getContext("2d");

  contexto.imageSmoothingEnabled = true;
  contexto.imageSmoothingQuality = "high";

  const larguraVideo = camera.videoWidth;
  const alturaVideo = camera.videoHeight;

  const proporcaoFinal =
    larguraFinal / alturaFinal;

  const proporcaoVideo =
    larguraVideo / alturaVideo;

  let origemX = 0;
  let origemY = 0;

  let larguraRecorte = larguraVideo;
  let alturaRecorte = alturaVideo;


  /* RECORTE SEM DEFORMAR */

  if (proporcaoVideo > proporcaoFinal) {

    larguraRecorte =
      alturaVideo * proporcaoFinal;

    origemX =
      (larguraVideo - larguraRecorte) / 2;

  } else {

    alturaRecorte =
      larguraVideo / proporcaoFinal;

    origemY =
      (alturaVideo - alturaRecorte) / 2;

  }


  /* DESENHA A FOTO ESPELHADA */

  contexto.fillStyle = "#000";
  contexto.fillRect(
    0,
    0,
    larguraFinal,
    alturaFinal
  );

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


  /* APLICA A MOLDURA */

  if (!moldura.complete) {
    await new Promise((resolve) => {
      moldura.onload = resolve;
    });
  }

  contexto.drawImage(
    moldura,
    0,
    0,
    larguraFinal,
    alturaFinal
  );


  /* GERA A FOTO */

  canvas.toBlob((blob) => {

    if (!blob) {
      alert("Não foi possível gerar a foto.");
      return;
    }

    fotoBlob = blob;

    if (fotoUrl) {
      URL.revokeObjectURL(fotoUrl);
    }

    fotoUrl = URL.createObjectURL(blob);

    fotoResultado.src = fotoUrl;


    /*
      MOSTRA A FOTO E OS BOTÕES
      SEM DEPENDER DO EVENTO ONLOAD
    */

    fotoResultado.classList.remove("escondido");

    camera.classList.add("escondido");

    moldura.classList.add("escondido");

    controleCamera.classList.add("escondido");

    acoes.classList.add("ativo");

  }, "image/png");

});


/* SALVAR OU COMPARTILHAR */

salvar.addEventListener("click", async () => {

  if (!fotoBlob) {
    alert("A foto ainda não foi gerada.");
    return;
  }

  const arquivo = new File(
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
        title: "Foto dos 50 anos",
        text: "Minha foto da festa! ✨",
        files: [arquivo]
      });

      return;
    }

  } catch (erro) {

    if (erro.name === "AbortError") {
      return;
    }

    console.error(
      "Erro ao compartilhar:",
      erro
    );
  }


  /* ALTERNATIVA PARA NAVEGADORES SEM COMPARTILHAMENTO */

  const url =
    URL.createObjectURL(fotoBlob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    "foto-50-anos.png";

  document.body.appendChild(link);

  link.click();

  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 2000);

});


/* TIRAR OUTRA FOTO */

novaFoto.addEventListener("click", () => {

  if (fotoUrl) {
    URL.revokeObjectURL(fotoUrl);
    fotoUrl = null;
  }

  fotoResultado.src = "";

  fotoResultado.classList.add(
    "escondido"
  );

  camera.classList.remove(
    "escondido"
  );

  moldura.classList.remove(
    "escondido"
  );

  controleCamera.classList.remove(
    "escondido"
  );

  acoes.classList.remove(
    "ativo"
  );

  fotoBlob = null;

});


/* INICIA A CÂMERA */

abrirCamera();
