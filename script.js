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


/* =====================================================
   ABRIR A CÂMERA FRONTAL
===================================================== */

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

    await new Promise((resolve) => {

      camera.onloadedmetadata = resolve;

    });

    await camera.play();

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


/* =====================================================
   TIRAR A FOTO
===================================================== */

capturar.addEventListener(
  "click",
  async () => {

    /* Verifica se a câmera está pronta */

    if (

      camera.readyState < 2 ||

      camera.videoWidth === 0 ||

      camera.videoHeight === 0

    ) {

      alert(
        "A câmera ainda está carregando. " +
        "Aguarde alguns segundos e tente novamente."
      );

      return;

    }


    /* Tamanho final do Story */

    const larguraFinal = 1080;

    const alturaFinal = 1920;


    /* Configura o Canvas */

    canvas.width = larguraFinal;

    canvas.height = alturaFinal;


    const contexto =
      canvas.getContext("2d");


    contexto.imageSmoothingEnabled = true;

    contexto.imageSmoothingQuality = "high";


    /* Dimensões reais da câmera */

    const larguraVideo =
      camera.videoWidth;

    const alturaVideo =
      camera.videoHeight;


    /* Proporção final: 9:16 */

    const proporcaoFinal =
      larguraFinal /
      alturaFinal;


    /* Proporção recebida da câmera */

    const proporcaoVideo =
      larguraVideo /
      alturaVideo;


    let origemX = 0;

    let origemY = 0;

    let larguraRecorte =
      larguraVideo;

    let alturaRecorte =
      alturaVideo;


    /* Faz o recorte sem deformar */

    if (
      proporcaoVideo >
      proporcaoFinal
    ) {

      /* A câmera é mais larga */

      larguraRecorte =
        alturaVideo *
        proporcaoFinal;

      origemX =
        (
          larguraVideo -
          larguraRecorte
        ) / 2;

    } else {

      /* A câmera é mais alta */

      alturaRecorte =
        larguraVideo /
        proporcaoFinal;

      origemY =
        (
          alturaVideo -
          alturaRecorte
        ) / 2;

    }


    /* Fundo preto */

    contexto.fillStyle = "#000";

    contexto.fillRect(
      0,
      0,
      larguraFinal,
      alturaFinal
    );


    /* Desenha a foto espelhada */

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


    /* Aguarda a moldura carregar */

    if (
      !moldura.complete
    ) {

      await new Promise(
        (resolve) => {

          moldura.onload =
            resolve;

        }
      );

    }


    /* Aplica a moldura */

    contexto.drawImage(

      moldura,

      0,
      0,

      larguraFinal,
      alturaFinal

    );


    /* Gera a imagem em PNG */

    canvas.toBlob(

      (blob) => {

        if (!blob) {

          alert(
            "Não foi possível gerar a foto."
          );

          return;

        }


        /* Salva a imagem na memória */

        fotoBlob = blob;


        /* Cria a prévia */

        fotoUrl =
          URL.createObjectURL(
            blob
          );


        fotoResultado.src =
          fotoUrl;


        /* Espera a imagem carregar */

        fotoResultado.onload =
          () => {


            /* Mostra a foto */

            fotoResultado
              .classList
              .remove(
                "escondido"
              );


            /* Esconde a câmera */

            camera
              .classList
              .add(
                "escondido"
              );


            /* Esconde a moldura */

            moldura
              .classList
              .add(
                "escondido"
              );


            /* Esconde a bolinha */

            controleCamera
              .classList
              .add(
                "escondido"
              );


            /* Mostra os botões */

            acoes
              .classList
              .add(
                "ativo"
              );

          };

      },

      "image/png"

    );

  }
);


/* =====================================================
   SALVAR OU COMPARTILHAR
===================================================== */

salvar.addEventListener(
  "click",
  async () => {

    if (!fotoBlob) {

      alert(
        "A foto ainda não foi gerada."
      );

      return;

    }


    /* Cria o arquivo da foto */

    const arquivo =
      new File(

        [fotoBlob],

        "foto-50-anos.png",

        {

          type:
            "image/png"

        }

      );


    try {


      /* Tenta abrir o compartilhamento nativo */

      if (

        navigator.share &&

        navigator.canShare &&

        navigator.canShare({

          files:
            [arquivo]

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


        return;

      }


    } catch (erro) {


      /* A pessoa fechou o menu */

      if (

        erro.name ===
        "AbortError"

      ) {

        return;

      }


      console.log(

        "Compartilhamento não disponível:",

        erro

      );

    }


    /* ================================================
       ALTERNATIVA PARA XIAOMI E OUTROS ANDROIDS
    ================================================= */


    const url =
      URL.createObjectURL(
        fotoBlob
      );


    /* Tenta abrir a foto em uma nova aba */

    const novaAba =
      window.open(

        url,

        "_blank"

      );


    /* Se o navegador bloquear a nova aba,
       tenta fazer o download */

    if (!novaAba) {


      const link =
        document.createElement(
          "a"
        );


      link.href =
        url;


      link.download =
        "foto-50-anos.png";


      document.body
        .appendChild(
          link
        );


      link.click();


      link.remove();

    }


    /* Mantém a imagem disponível por 1 minuto */

    setTimeout(

      () => {

        URL.revokeObjectURL(
          url
        );

      },

      60000

    );

  }
);


/* =====================================================
   TIRAR OUTRA FOTO
===================================================== */

novaFoto.addEventListener(
  "click",
  () => {


    /* Libera a imagem anterior */

    if (fotoUrl) {

      URL.revokeObjectURL(
        fotoUrl
      );

      fotoUrl = null;

    }


    /* Limpa a prévia */

    fotoResultado.src =
      "";


    fotoResultado
      .classList
      .add(
        "escondido"
      );


    /* Mostra novamente a câmera */

    camera
      .classList
      .remove(
        "escondido"
      );


    /* Mostra a moldura */

    moldura
      .classList
      .remove(
        "escondido"
      );


    /* Mostra a bolinha */

    controleCamera
      .classList
      .remove(
        "escondido"
      );


    /* Esconde os botões */

    acoes
      .classList
      .remove(
        "ativo"
      );


    /* Limpa a foto anterior */

    fotoBlob = null;

  }
);


/* =====================================================
   INICIAR A CÂMERA
===================================================== */

abrirCamera();
