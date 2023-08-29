<?php
    // Variables
    $nombre=$_POST["nombre"];
    $email=$_POST["email"];
    $telefono=$_POST["telefono"];
    $mensaje=$_POST["mensaje"];

    $destinatario="gianninacallegari@gmail.com"; //Correo al que vamos a enviar los datos
    $asunto="Nuevo mensaje de $nombre"; //El asunto de los mails que me llegan

    // Configuro contenido
    $contenido="Nombre: $nombre \n";
    $contenido.="Email: $email \n";
    $contenido.="Telefono: $telefono \n";
    $contenido.="Mensaje: $mensaje";

    $header="From: prestamoshot@info.com" . "\r\n" .
    "Reply-To: $email" . "\r\n" .
    "Content-Type: text/plain; charset=UTF-8";

    // La funcion mail envia un correo electronico. y el orden es:
    // A quien se lo envia - El titulo del correo - El mensaje - Header para añadir

    mail($destinatario, $asunto, $contenido, $header);

    if (mail($destinatario, $asunto, $contenido, $header)) {
        echo "El correo se envió correctamente";
    } else {
        echo "Hubo un problema al enviar el correo";
    }

    // Redireccion al haber enviado el form
    header('location:index.html');
    
?>