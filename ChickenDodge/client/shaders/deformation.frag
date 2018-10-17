precision mediump float;

/* Rendu du jeu */
uniform sampler2D uSampler;

/* Texture de déformation en rouge et vert */
uniform sampler2D uDeformation;

/* Texture pour contrôler l'intensité de la déformation */
uniform sampler2D uIntensity;

/* Interval de temps multiplié par la vitesse depuis l'activation du composant */
uniform float uTime;

/* Échelle de la déformation */
uniform float uScale;

/* Coordonnées UV du fragment */
varying vec2 vTextureCoord;

void main(void) {

    //calcul de l'intensité de la deformation selon le temps
    vec4 intensite = texture2D(uIntensity, vec2(uTime, 0.5));
    //mise à l'échelle
    intensite *= uScale;

    //recherche du vecteur de déformation décalé selon un sinus (temps)
    vec4 deformation = texture2D(uDeformation, vTextureCoord + sin(uTime)); 
    //centrage de la deformation
    deformation -= 0.5;
    //modulation par l'intensité
    deformation *= intensite;

    //application de la deformation
    vec2 colorCoord = vec2(vTextureCoord.x + deformation.x , vTextureCoord.y + deformation.y );
    vec4 color = texture2D(uSampler, colorCoord);

    gl_FragColor = color;   

}
