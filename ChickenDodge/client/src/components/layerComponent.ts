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
    //définit GL
    if(GL == undefined) {
      GL = GraphicsAPI.context;
    }
    //recupère tous les sprites du layer.
    const layerSprites = this.listSprites();
    if (layerSprites.length === 0) {
      return;
    }

    //stocker l'unique spritesheet.
    const spriteSheet = layerSprites[0].spriteSheet;

    let offset_v = 0;
    let offset_i = 0;

    let vertex_per_sprite = 4;
    let indices_per_sprite = 6;

    //créer deux tableaux qui vont contenir tous les vertex et les indices du layer
    const vertices: Float32Array = new Float32Array(vertex_per_sprite * TextureComponent.vertexSize * layerSprites.length)
    const indexes: Uint16Array = new Uint16Array(indices_per_sprite * layerSprites.length)

    //creation buffer
    const vertexBuffer = GL.createBuffer();
    const indexBuffer = GL.createBuffer();

    //bind buffer
    GL.bindBuffer(GL.ARRAY_BUFFER, vertexBuffer);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, indexBuffer);
    
    //parcours de la liste de sprite et ajout des vertex et indices dans les tableaux
    let i = 0;
    layerSprites.forEach(element => {
      //recup vertex
      vertices.set(element.vertices, offset_v);

      //recup indices
      let elem_indices: Uint16Array = new Uint16Array();
      elem_indices = element.indices
      elem_indices = elem_indices.map(function(value) {
      //changement du referentiel de l'indice: sprite => layer.  
        return value + vertex_per_sprite * i;
      })
      indexes.set(elem_indices, offset_i);
      // mise-à-jour offset.
      offset_v += vertex_per_sprite * TextureComponent.vertexSize;
      offset_i += indices_per_sprite;
      i++;
    });

    //copie les données (vertex, indice) dans les buffers.
    GL.bufferData(GL.ARRAY_BUFFER, vertices, GL.DYNAMIC_DRAW);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, indexes, GL.DYNAMIC_DRAW);

    //bind le spritesheet.
    spriteSheet.bind();
    //dessine le layer.
    GL.drawElements(GL.TRIANGLES, 6*layerSprites.length, GL.UNSIGNED_SHORT, 0);
    //unbind le spritesheet.
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
