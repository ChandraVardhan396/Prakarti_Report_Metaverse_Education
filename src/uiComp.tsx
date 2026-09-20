import { Color4 } from '@dcl/sdk/math';
import ReactEcs, { ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs';
import * as npc from 'dcl-npc-toolkit';
import * as ui from 'dcl-ui-toolkit';

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(combinedUiRenderer);
}

const uiComponent = () => (
  <UiEntity
    uiTransform={{
      width: '100%',
      height: '100%',
    }}
  >
    <npc.NpcUtilsUi />
  </UiEntity>
);

function combinedUiRenderer() {
  return (
    <UiEntity
  uiTransform={{
    width: '100%',
    height: '100%',
    positionType: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  }}
>
  {uiComponent()}
  {ui.render()}
</UiEntity>

  );
}
