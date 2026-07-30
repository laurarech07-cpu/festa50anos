const camera = document.getElementById("camera");
const moldura = document.getElementById("moldura");
const fotoResultado = document.getElementById("fotoResultado");

const capturar = document.getElementById("capturar");
const controleCamera = document.getElementById("controleCamera");

const acoes = document.getElementById("acoes");
const salvar = document.getElementById("salvar");
const compartilhar = document.getElementById("compartilhar");
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

      audio:false

    });


    camera.srcObject = stream;


    await camera.play();



  } catch (erro) {

    console.error(
      "Erro câmera:",
      erro
    );


    alert(
      "Não foi possível abrir a câmera."
    );

  }

}





/* CAPTURAR FOTO */

capturar.addEventListener(
"click",
async()=>{


  if(

    camera.readyState < 2 ||

    camera.videoWidth === 0 ||

    camera.videoHeight === 0

  ){

    alert(
      "A câmera ainda está carregando."
    );

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




  if(proporcaoVideo > proporcaoFinal){


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





  /* MOLDURA */


  if(!moldura.complete){

    await new Promise(resolve=>{

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





  /* GERAR IMAGEM */


  canvas.toBlob(

    blob=>{


      if(!blob){

        alert(
          "Erro ao gerar foto."
        );

        return;

      }



      fotoBlob = blob;



      if(fotoUrl){

        URL.revokeObjectURL(
          fotoUrl
        );

      }



      fotoUrl =
        URL.createObjectURL(blob);



      fotoResultado.src =
        fotoUrl;




      /*
        MOSTRAR RESULTADO
      */


      fotoResultado.classList.remove(
        "escondido"
      );


      camera.classList.add(
        "escondido"
      );


      moldura.classList.add(
        "escondido"
      );


      controleCamera.classList.add(
        "escondido"
      );



      // CORREÇÃO IPHONE

      acoes.classList.remove(
        "escondido"
      );


      acoes.classList.add(
        "ativo"
      );



    },

    "image/png"

  );


});






/* SALVAR FOTO - IPHONE */

salvar.addEventListener(
"click",
()=>{


  if(!fotoUrl){

    alert(
      "Foto ainda não disponível."
    );

    return;

  }



  const janela =
    window.open();



  if(janela){


    janela.document.write(`

      <html>

      <head>

      <title>
      Foto 50 anos
      </title>


      </head>


      <body style="
      margin:0;
      background:#000;
      display:flex;
      justify-content:center;
      align-items:center;
      height:100vh;
      ">


      <img 
      src="${fotoUrl}"
      style="
      max-width:100%;
      max-height:100%;
      ">


      </body>


      </html>

    `);


  }


});







/* COMPARTILHAR */


compartilhar.addEventListener(
"click",
async()=>{


  if(!fotoBlob){

    alert(
      "Foto ainda não disponível."
    );

    return;

  }



  const arquivo =
    new File(

      [fotoBlob],

      "foto-50-anos.png",

      {
        type:"image/png"
      }

    );





  try{


    if(

      navigator.share &&

      navigator.canShare &&

      navigator.canShare({

        files:[
          arquivo
        ]

      })

    ){


      await navigator.share({

        title:
        "Foto dos 50 anos",

        text:
        "Minha foto da festa ✨",

        files:[
          arquivo
        ]

      });


    } else {


      alert(
        "Compartilhamento não disponível neste aparelho."
      );


    }



  }catch(erro){

    console.log(
      erro
    );

  }



});







/* NOVA FOTO */


novaFoto.addEventListener(
"click",
()=>{


  if(fotoUrl){

    URL.revokeObjectURL(
      fotoUrl
    );

    fotoUrl=null;

  }




  fotoResultado.src="";



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



  acoes.classList.add(
    "escondido"
  );


  acoes.classList.remove(
    "ativo"
  );



  fotoBlob=null;



});






/* INICIAR */

abrirCamera();
