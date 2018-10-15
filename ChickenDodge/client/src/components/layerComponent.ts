import { Component } from './component';
import { SpriteComponent } from './spriteComponent';
import { IDisplayComponent } from '../displaySystem';
import * as GraphicsAPI from '../graphicsAPI';
import { TextureComponent } from './textureComponent';

let GL: WebGLRenderingContext;

// # Classe *LayerComponent*
// Ce composant représente un ensemble de sprites qui
// doivent normalement être considérées comme étant sur un
// même plan.
export class LayerComponent extends Component<Object> implements IDisplayComponent {
  // ## Méthode *display*
  // La méthode *display* est appelée une fois par itération
  // de la boucle de jeu.
  display(dT: number) {
    const layerSprites = this.listSprites();
    if (layerSprites.length === 0) {
      return;
    }
    const spriteSheet = layerSprites[0].spriteSheet;
    let offset_v = 0;
    let offset_i = 0;
    GL = GraphicsAPI.context;

    const vertices: Float32Array = new Float32Array(4*TextureComponent.vertexSize * layerSprites.length)
    const indexes: Uint16Array = new Uint16Array(6*layerSprites.length)

    const vertexBuffer = GL.createBuffer();
    const indexBuffer = GL.createBuffer();

    GL.bindBuffer(GL.ARRAY_BUFFER, vertexBuffer);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, indexBuffer);
    
    let i = 0;
    layerSprites.forEach(element => {
      vertices.set(element.vertices, offset_v);
      let elem_indices: Uint16Array = new Uint16Array();
      elem_indices = element.indices
      elem_indices = elem_indices.map(function(value) {
        return value + 4 * i;
      })
      indexes.set(elem_indices, offset_i);
      offset_v += 4*TextureComponent.vertexSize;
      offset_i += 6;
      i++;
    });
    GL.bufferData(GL.ARRAY_BUFFER, vertices, GL.DYNAMIC_DRAW);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, indexes, GL.DYNAMIC_DRAW);
    spriteSheet.bind();
    GL.drawElements(GL.TRIANGLES, 6*layerSprites.length, GL.UNSIGNED_SHORT, 0);
    spriteSheet.unbind();
  }

  // ## Fonction *listSprites*
  // Cette fonction retourne une liste comportant l'ensemble
  // des sprites de l'objet courant et de ses enfants.
  private listSprites() {
    const sprites: SpriteComponent[] = [];
    this.owner.walkChildren((child) => {
      if (!child.active)
        return;

      child.walkComponent((comp) => {
        if (comp instanceof SpriteComponent && comp.enabled)
          sprites.push(comp);
      });
    });

    return sprites;
  }
}
