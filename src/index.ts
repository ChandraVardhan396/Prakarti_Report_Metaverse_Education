import { Quaternion, Vector3 } from '@dcl/sdk/math'
import {
  engine,
  GltfContainer,
  InputAction,
  pointerEventsSystem,
  Transform,
  Animator,
  Material,
  VideoPlayer,
  MeshRenderer,
  MeshCollider,
  AudioSource,
  inputSystem,
  PointerEventType
} from '@dcl/sdk/ecs'
import * as ui from 'dcl-ui-toolkit'
import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { openExternalUrl } from '~system/RestrictedActions'
import { ClimateDataBoard } from './ui/ClimateDataBoard'

const position = Vector3.create(16, 0.1, 16)
const scale = Vector3.create(0.97, 0.97, 0.97)
ReactEcsRenderer.setUiRenderer(ui.render)

// Initialize the Climate Data Information Board
new ClimateDataBoard(
  Vector3.create(1, 7.20, 9.00),
  Quaternion.fromEulerDegrees(0, -90, 0) // Y=-90 (Yaw) points the front face East toward the tree
)

var score = 0;
var activity = 0;

var start = true;
var tree_invest = false;
var solar_invest = false;
var ozone_invest = false;

const assign_aud = engine.addEntity()
AudioSource.create(assign_aud,{
  audioClipUrl:'audios/assign.mp3',
  playing:false
})

//models 
const tree = engine.addEntity()
GltfContainer.create(tree, {
  src: 'models/Tree.glb'
})
Transform.create(tree,{position,scale})

const cup = engine.addEntity()
GltfContainer.create(cup, { src: 'models/Cup.glb' })
Transform.create(cup, { position, scale })

const dust = engine.addEntity()
GltfContainer.create(dust, { src: 'models/Dust.glb' })
Transform.create(dust, { position, scale })

const glass = engine.addEntity()
GltfContainer.create(glass, { src: 'models/glass.glb' })
Transform.create(glass, { position, scale })

const match = engine.addEntity()
GltfContainer.create(match, { src: 'models/match.glb' })
Transform.create(match, { position, scale })

const mud = engine.addEntity()
GltfContainer.create(mud, { src: 'models/mud.glb' })
Transform.create(mud, { position, scale })

const news1 = engine.addEntity()
GltfContainer.create(news1, { src: 'models/News1.glb' })
Transform.create(news1, { position, scale })

const news2 = engine.addEntity()
GltfContainer.create(news2, { src: 'models/News2.glb' })
Transform.create(news2, { position, scale })

const plastic = engine.addEntity()
GltfContainer.create(plastic, { src: 'models/plastic.glb' })
Transform.create(plastic, { position, scale })

const bottle = engine.addEntity()
GltfContainer.create(bottle, { src: 'models/bottle.glb' })
Transform.create(bottle, { position, scale })

const ozone = engine.addEntity()
GltfContainer.create(ozone, { src: 'models/Ozone.glb' })
Transform.create(ozone, { position, scale })
AudioSource.create(ozone,{
  audioClipUrl:'audios/ozone.mp3',
  playing:false
})

const solars = engine.addEntity()
GltfContainer.create(solars, { src: 'models/solars.glb' })
Transform.create(solars, { position, scale })
AudioSource.create(solars,{
  audioClipUrl:'audios/solar.mp3',
  playing:false
})

const sustainable = engine.addEntity()
GltfContainer.create(sustainable, { src: 'models/Sustainable.glb' })
Transform.create(sustainable, { position, scale })
Animator.create(sustainable, {
  states: [{ clip: 'Main', playing: true, loop: true }]
})
AudioSource.create(sustainable,{
  audioClipUrl:'audios/tree.mp3',
  playing:true,
})

const mill1 = engine.addEntity()
GltfContainer.create(mill1, { src: 'models/Mill1.glb' })
Transform.create(mill1, { position, scale })
Animator.create(mill1, {
  states: [{ clip: 'Mill1', playing: false, loop: true }]
})

const mill2 = engine.addEntity()
GltfContainer.create(mill2, { src: 'models/Mill2.glb' })
Transform.create(mill2, { position, scale })
Animator.create(mill2, {
  states: [{ clip: 'Mill2', playing: false, loop: true }]
})

const water = engine.addEntity();
GltfContainer.create(water,{
  src:"models/water.glb"
})
Transform.create(water,{position,scale});
Animator.create(water,{
  states:[
    {
      clip:"Water",
      playing:false,
      loop:false
    }
  ]
})
AudioSource.create(water,{
  audioClipUrl:'audios/garbage.mp3',
  playing:false
})

pointerEventsSystem.onPointerDown({
  entity:water,
  opts:{
    hoverText:"Water Alert",
    button: InputAction.IA_POINTER
  }
},function(){
  alert.show(3);
})

const assign = engine.addEntity();
GltfContainer.create(assign,{
  src:"models/Assign.glb"
});
Transform.create(assign,{position,scale});

pointerEventsSystem.onPointerDown({
  entity:assign,
  opts:{
    hoverText:"Start Assignment",
    button:InputAction.IA_POINTER
  }
},function(){
  question1.show();
}
)

//screen
const screen = engine.addEntity()
MeshRenderer.setPlane(screen)
MeshCollider.setPlane(screen)

Transform.create(screen, { 
  position: { x: 29.7, y: 7, z: 16},
  scale: Vector3.create(17.6,8.4,7), 
  rotation: Quaternion.fromEulerDegrees(0,90,0)
})

VideoPlayer.create(screen, {
    src: 'videos/windmill.mp4',
    playing: false,
    loop: true
})

const video_texture = Material.Texture.Video({videoPlayerEntity:screen})

Material.setBasicMaterial(screen,{
  texture:video_texture,
})

// Ui Images 
const alert = ui.createComponent(ui.CenterImage,{
  image:"images/alert.png",
  width:271,
  height:229,
  startHidden:true,
  duration:3
})

const treeCard = ui.createComponent(ui.CenterImage, {
  image: 'images/tree.jpg',
  width: 450,
  height: 670,
  startHidden:true,
  duration:999999 
})

const solarCard = ui.createComponent(ui.CenterImage, {
  image: 'images/solar_card.jpg',
  width: 450,
  height: 670,
  startHidden:true,
  duration:999999 
})

const ozoneCard = ui.createComponent(ui.CenterImage, {
  image: 'images/Ozone_card.jpg',
  width: 450,
  height: 670,
  startHidden: true,
  duration:99999 
})

const card = ui.createComponent(ui.LargeIcon,{
  image:"images/Card.png",
  width:300,
  height:410,
  startHidden:false,
})

const card2 = ui.createComponent(ui.LargeIcon,{
  image:"images/Card2.png",
  width:300,
  height:410,
  startHidden:true,
})

const card3 = ui.createComponent(ui.LargeIcon,{
  image:"images/Card3.png",
  width:300,
  height:410,
  startHidden:true,
})

const card4 = ui.createComponent(ui.LargeIcon,{
  image:"images/Card4.png",
  width:300,
  height:410,
  startHidden:true,
})

const card5 = ui.createComponent(ui.LargeIcon,{
  image:"images/Card5.png",
  width:300,
  height:410,
  startHidden:true,
})

const correct = ui.createComponent(ui.CenterImage,{
  image:"images/correct.png",
  width : 400,
  height:50,
  startHidden:true,
  duration:1,
  yOffset:300
})

const wrong = ui.createComponent(ui.CenterImage,{
  image:"images/wrong.png",
  width : 400,
  height:50,
  startHidden:true,
  duration:1,
  yOffset:300
})

const cong = ui.createComponent(ui.CenterImage,{
  image:"images/cong.png",
  width:700,
  height:350,
  startHidden:true,
  duration:2,
})

// prompts 
// Assignments  Questions

const question1 = ui.createComponent(ui.FillInPrompt,{
  title: "What molecule (O₃) forms a protective layer in the sky?",
  onAccept: (value: string) => {
    if(value=="Ozone" || value=="ozone"){
        score+=10;
        correct.show(1);
        question1.hide();
        question2.show();
    }
    else{
      wrong.show(1);
      question1.hide();
      question2.show();
    }
  },
})

const question2 = ui.createComponent(ui.FillInPrompt,{
  title: "What type of harmful radiation from the sun does the ozone layer block?",
  onAccept: (value: string) => {
    if(value=="UV" || value=="uv"){
        score+=10;
        correct.show(1);
        question2.hide();
        question3.show();
    }
    else{
      wrong.show(1);
      question2.hide();
      question3.show();
    }
  },
})

const question3 = ui.createComponent(ui.FillInPrompt,{
  title: "What element, vital for breathing, do trees produce?",
  onAccept: (value: string) => {
    if(value=="Oxygen" || value=="oxygen"){
        score+=10;
        correct.show(1);
        question3.hide();
        question4.show();
    }
    else{
      wrong.show(1);
      question3.hide();
        question4.show();
    }
  },
})

const question4 = ui.createComponent(ui.FillInPrompt,{
  title: "What do solar panels generate for homes and businesses?",
  onAccept: (value: string) => {
    if(value=="Power" || value=="power"){
        score+=10;
        correct.show(1);
        question4.hide();
        question5.show();
        const audio = AudioSource.getMutable(assign_aud);
    audio.playing=true;
    }
    else{
      wrong.show(1);
      question4.hide();
      question5.show();
      const audio = AudioSource.getMutable(assign_aud);
    audio.playing=true;
    }
  },
})

const question5 = ui.createComponent(ui.FillInPrompt,{
  title: "What is the modern technical name for a machine that converts wind into electricity?",
  onAccept: (value: string) => {
    if(value=="Turbine" || value=="turbine"){
        score+=10;
        correct.show(1);
        question5.hide();
        cong.show(2)
    }
    if(value=="Wind Mill" || value=="wind mill"){
        score+=10;
        correct.show(1);
        question5.hide();
        cong.show(2)
    }
    else{
       wrong.show(1);
       question5.hide();
       cong.show(2)

    }
  },
})

const prompt = ui.createComponent(ui.CustomPrompt,{startHidden:true,height:10,width:10})

const cancelIcon = prompt.addButton({
  style: ui.ButtonStyles.E,
  text: 'Cancel',
  xPosition:250,
  yPosition:180,
  onMouseDown: function (): void {
    hideAllCards()
  }
})

function hideAllCards() {
  treeCard.hide()
  solarCard.hide()
  ozoneCard.hide()
  prompt.hide()
}

function hideAll(){
  card.hide()
  card2.hide()
  card3.hide()
  card4.hide()
  card5.hide()
}

function updateVideoState() {
    const mill1Animator = Animator.get(mill1)
    const mill2Animator = Animator.get(mill2)
    const videoPlayer = VideoPlayer.getMutable(screen)

    const isMill1Playing = mill1Animator.states[0].playing
    const isMill2Playing = mill2Animator.states[0].playing
    
    if (isMill1Playing || isMill2Playing) {
        videoPlayer.playing = true
    } else {
        videoPlayer.playing = false
    }
}

var count = 0;

const garbage = [glass, news1, news2, plastic, match, mud, cup, bottle]
garbage.forEach(entity => {
  pointerEventsSystem.onPointerDown(
    { entity, opts: { hoverText: 'Collect', button: InputAction.IA_POINTER } },
    () => { 
  GltfContainer.deleteFrom(entity);
  count+=1;
  if (count==7 && ozone_invest){
    hideAll();
    card5.show();
    const anim = Animator.getClip(water,"Water");
    anim.playing = true;
    
  } 
}
  )
})

const mills = [mill1, mill2]
mills.forEach(mill => {
  pointerEventsSystem.onPointerDown(
    { entity: mill, opts: { hoverText: 'Start/Stop Mill', button: InputAction.IA_POINTER } },
    () => {
      const animator = Animator.getMutable(mill)
      const clip = animator.states[0]
      clip.playing = !clip.playing
      
      updateVideoState()
    }
  )
})

// pointerEvents
pointerEventsSystem.onPointerDown(
  { entity: tree, opts: { hoverText: 'Show Info', button: InputAction.IA_POINTER } },
  () => {
    hideAllCards()
    prompt.show() 
    treeCard.show()
    if(start){
      hideAll();
      card2.show();
      tree_invest=true;
      start=false;
      const audio = AudioSource.getMutable(solars);
      audio.playing=true;
    }
  }
)

pointerEventsSystem.onPointerDown(
  { entity: solars, opts: { hoverText: 'Show Info', button: InputAction.IA_POINTER } },
  () => {
    hideAllCards();
    solarCard.show();
    prompt.show();
    if(tree_invest){
      hideAll();
      card3.show();
      solar_invest=true;
      tree_invest=false;
      const audio = AudioSource.getMutable(ozone);
      audio.playing=true;
    }
  }
)

pointerEventsSystem.onPointerDown(
  { entity: ozone, opts: { hoverText: 'Show Info', button: InputAction.IA_POINTER } },
  () => {
    hideAllCards();
    ozoneCard.show();
    prompt.show();
    if(solar_invest){
      hideAll();
      card4.show();
      ozone_invest = true;
      solar_invest=false;
      const audio = AudioSource.getMutable(water);
      audio.playing=true;
    }
  }
)
