import { Component, IComponent } from './component';
import { PositionComponent } from './positionComponent';
import { ILogicComponent } from '../logicSystem';
import { Rectangle } from './rectangle';
import { canvas } from '../graphicsAPI';
import { ChickenComponent } from './chickenComponent';


export interface ICollisionComponent extends IComponent {
  onCollision(other: ColliderComponent): void;
}

// ## Variable *colliders*
// On conserve ici une référence vers toutes les instances
// de cette classe, afin de déterminer si il y a collision.
const colliders: ColliderComponent[] = [];

// # Classe *ColliderComponent*
// Ce composant est attaché aux objets pouvant entrer en
// collision.
interface ISize {
  w: number;
  h: number;
}

interface IColliderComponentDesc {
  flag: number;
  mask: number;
  size: ISize;
  handler?: string;
}

export class ColliderComponent extends Component<IColliderComponentDesc> implements ILogicComponent {
  private flag!: number;
  private mask!: number;
  private size!: ISize;
  private handler?: ICollisionComponent;
  private active = true;

  // ## Méthode *create*
  // Cette méthode est appelée pour configurer le composant avant
  // que tous les composants d'un objet aient été créés.
  create(descr: IColliderComponentDesc) {
    this.flag = descr.flag;
    this.mask = descr.mask;
    this.size = descr.size;
  }

  // ## Méthode *setup*
  // Si un type *handler* est défini, on y appellera une méthode
  // *onCollision* si une collision est détectée sur cet objet.
  // On stocke également une référence à l'instance courante dans
  // le tableau statique *colliders*.
  setup(descr: IColliderComponentDesc) {
    if (descr.handler) {
      this.handler = this.owner.getComponent<ICollisionComponent>(descr.handler);
    }
    colliders.push(this);
  }

  // ## Méthode *update*
  // À chaque itération, on vérifie si l'aire courante est en
  // intersection avec l'aire de chacune des autres instances.
  // Si c'est le cas, et qu'un type *handler* a été défini, on
  // appelle sa méthode *onCollision* avec l'objet qui est en
  // collision.
  update() {
    if (!this.handler) {
      return;
    }

    const area = this.area;
    colliders.forEach((c) => {
      if (c === this ||
        !c.enabled ||
        !c.owner.active) {
        return;
      }


     // Vérification si collision possible par opération : flag & mask
      let collisionCheck = this.flag & c.mask;
      if (collisionCheck == 0){
        return;
      }

      // Vérification par sudbdivision spatiale (quad tree)
      if (! this.quadTreeCheck(4, c)){
        return;
      }
      
      // Vérification par rectangles englobants.
      if (area.intersectsWith(c.area)) {
        this.handler!.onCollision(c);
      }

    });
  }

  // ## Propriété *area*
  // Cette fonction calcule l'aire courante de la zone de
  // collision, après avoir tenu compte des transformations
  // effectuées sur les objets parent.
  get area() {
    const position = this.owner.getComponent<PositionComponent>('Position').worldPosition;
    return new Rectangle({
      x: position[0],
      y: position[1],
      width: this.size.w,
      height: this.size.h,
    });
  }

  // ## Méthode *Quad tree*
  // Subdivision spatiale de l'écran en quad tree 
  // afin de vérifier si deux composants se trouvent dans la même zone ou non
  quadTreeCheck(n : number, c : ColliderComponent) : boolean {
    //canvas du jeu
    let currentRectangle = new Rectangle ({
      x: canvas.width/2,
      y: canvas.height/2,
      width: canvas.width,
      height: canvas.height,
    });

    let inSameZone = false;
    //pour chaque subdivision
    for (let k = 0; k<n; k++){
      
      inSameZone = false;
      //on redivise en 4
      let childrenRectangle: Rectangle[] = this.addChildrenToQuadTree(currentRectangle);

      //on recupère les positions des deux colliders.
      const cPos = c.owner.getComponent<PositionComponent>('Position').worldPosition;
      const thisPos = this.owner.getComponent<PositionComponent>('Position').worldPosition;
        
      let i = 0;
      //on vérifie s'ils sont dans la même zone. Si oui, on arrête la recherche est on passe au niveau de subdivision suivant.
      while(i < childrenRectangle.length && !inSameZone){
        if (childrenRectangle[i].contains(cPos) && childrenRectangle[i].contains(thisPos)){
          inSameZone = true;
          currentRectangle = childrenRectangle[i];
        }
        i++;
      }
    }
    return inSameZone;
  }

  // Calcul des 4 sous rectangles
  addChildrenToQuadTree(r : Rectangle) : Rectangle[] {

    let childrenRectangle: Rectangle[] = [];

    // 1er fils en haut à gauche
    childrenRectangle.push(new Rectangle ({
      x: r.xMin + (r.xMax - r.xMin) / 4,
      y: r.yMin + (r.yMax - r.yMin) / 4,
      width: (r.xMax - r.xMin) / 2,
      height: (r.yMax - r.yMin) / 2,
    }));

    // 2eme fils en haut à droite
    childrenRectangle.push(new Rectangle ({
      x: r.xMin + (r.xMax - r.xMin) * (3/4),
      y: r.yMin + (r.yMax - r.yMin) / 4,
      width: (r.xMax - r.xMin) / 2,
      height: (r.yMax - r.yMin) / 2,
    }));

    // 3eme fils en bas à gauche
    childrenRectangle.push(new Rectangle ({
      x: r.xMin + (r.xMax - r.xMin) / 4,
      y: r.yMin + (r.yMax - r.yMin) * (3/4),
      width: (r.xMax - r.xMin) / 2,
      height: (r.yMax - r.yMin) / 2,
    }));

    // 4eme fils en bas à droite
    childrenRectangle.push(new Rectangle ({
      x: r.xMin + (r.xMax - r.xMin)  * (3/4),
      y: r.yMin + (r.yMax - r.yMin)  * (3/4),
      width: (r.xMax - r.xMin) / 2,
      height: (r.yMax - r.yMin) / 2,
    }));

    return childrenRectangle; 
  }


}
