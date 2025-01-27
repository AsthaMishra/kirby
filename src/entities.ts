import { AreaComp, BodyComp, DoubleJumpComp, GameObj, HealthComp, KaboomCtx, OpacityComp, PosComp, ScaleComp, SpriteComp } from "kaboom";
import { scale } from "./constants";


type playerGameobj = GameObj<
SpriteComp  &
AreaComp &
BodyComp &
ScaleComp &
PosComp &
DoubleJumpComp &
HealthComp &
OpacityComp  &
{
    speed:number,
    direction:string,
    isInhalling : boolean,
    isFull : boolean,
}
>;

export function makePlayer (k : KaboomCtx,posX : number, posY: number){
    const player = k.make([k.sprite("assets", {anim :"kirbIdle"}),
        k.area({shape:new k.Rect(k.vec2(4, 5.9), 8, 10)
        }),
        k.body(),
        k.pos(posX* scale, posY * scale),
        k.scale(scale),
        k.doubleJump(10),
        k.health(3),
        k.opacity(1),
        {
            speed:300,
            direction:"right",
            isInhalling : false,
            isFull : false,
        },
        "player",
          
        ]); 


        player.onCollide("enemy", async (enemy: GameObj) => {
            if(player.isInhalling && enemy.isInhalable){
                player.isInhalling = true;
                player.isFull = true;
                k.destroy(enemy);
                return;
            }

            if(player.hp() === 0){
                k.destroy(player);
                k.go("level-1");
                return;
            }

            player.hurt();

            await k.tween(
                player.opacity,
                0,
                0.05,
                (val) =>(player.opacity = val),
                k.easings.linear
            );

            await k.tween(
                player.opacity,
                1,
                0.05,
                (val) =>(player.opacity = val),
                k.easings.linear
            );
        });

        player.onCollide("exit", ()=>{
            k.go("level-2");
        });

        const inhaleEffect = k.add([
            k.sprite("assets", {anim :"kirbInhaling"}),
            k.pos(),
            k.scale(scale),
            k.opacity(1),
            "inhaleEffect",
        ]);

        const inhaleZone = player.add([
            k.area({shape: new k.Rect(k.vec2 (0),20, 4)}),
            k.pos(),
            "inhaleZone"
        ]);

        inhaleZone.onUpdate(()=>{
            if(player.direction === "left"){
                inhaleZone.pos = k.vec2(0,0), //14,8
                inhaleEffect.pos = k.vec2(player.pos.x - 60, 0),
                inhaleEffect.flipX = true;
                return;
            }
            inhaleZone.pos = k.vec2(0,0), //-14,8
            inhaleEffect.pos = k.vec2(player.pos.x + 60, 0),
            inhaleEffect.flipX = false;

        });

        player.onUpdate(()=>{
            if(player.pos.y > 2000){
                k.go("level-1");
            }
        });

        return player;
}

export function setControls (k: KaboomCtx, player: playerGameobj ){
    const inhaleEffectRef = k.get("inhaleEffect")[0] // only 1 effect in game thats why fetcing from 0 index

    k.onKeyDown((key)=>{
        switch(key){
            case "left":
                player.direction = "left";
                player.flipX = true;
                player.move(-player.speed, 0);
                break;
                case "right":
                    player.direction = "right";
                    player.flipX = false;
                    player.move(player.speed, 0);
                    break;
                    case "z":
                      if(player.isFull){
                        player.play("kirbFull");
                        inhaleEffectRef.opacity = 0;
                        break;
                      }

                      player.isInhalling = true;
                      player.play("kirbInhaling")
                      inhaleEffectRef.opacity = 1;
                        break;
                default:
        }
    });

    k.onKeyPress((key)=>{
        switch(key){
            case "space":
                player.doubleJump();
                break;
                default:
        }
    });

    k.onKeyRelease((key)=>{
        switch(key){
            case "z":
                // if(player.isInhalling){
                //     player.isInhalling = false;
                //     player.play("kirbIdle");
                //     break;

                // }

                // if(player.isFull){
                //   inhaleEffectRef.opacity = 0;
                //   break;
                // }

                // player.isInhalling = true;
                // player.play("kirbInhaling")
                // inhaleEffectRef.opacity = 1;
                  break;
                default:
        }
    });
}

//1:28