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
  //  gl_FragColor = texture2D(uSampler, vTextureCoord);
  //  gl_FragColor.gb *= 0.5;

    vec4 intensite = texture2D(uIntensity, vec2(uTime, 0.5));
    intensite *= uScale;

    vec4 deformation = texture2D(uDeformation, vTextureCoord + sin(uTime)); 

    deformation *= intensite;

    vec2 colorCoord = vec2(vTextureCoord.x + deformation.x, vTextureCoord.y + deformation.y);
    vec4 color = texture2D(uSampler, colorCoord);

    gl_FragColor = color;   

}
