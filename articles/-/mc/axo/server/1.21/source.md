<p hidden meta>
Title: 1.21 Server Update
Author: @TheAxolot77
AuthorTitle: Author/Owner
Banner: https://sbamboo.github.io/theaxolot77/assets/articles/banners/mc_server_1.21.png
Favicon: https://sbamboo.github.io/theaxolot77/assets/logo_theaxo77.png
CardBackground: https://sbamboo.github.io/theaxolot77/assets/articles/banners/mc_server_1.21.png
Tags: news,changelog,minecraft,mc,axo,server
CreationDate: 2024-07-05
UpdatedDate: 2024-07-05
</p>

**Quite alot has changed!**
<br><br>

## ServerSide
- **Updated to 1.21**
    After hopping *1.20.5* and *1.20.6* to wait for plugins/datapacks to update,
    the server is finally updated.

    * Some datapacks had not updated to 1.21 so alternatives have been found:

        - CustomArcheology: Found alternative, should work the same.
        - MoreArmorTrims: Manually forked and updated.
        - HeadEquip: Found alternative, should work the same.
        - PlayTime: Updated.
    
    * Some new datapacks:

        - Villager Workstation Hightlights *(Testing, might get removed)*

    * Known issues/bugs in datapacks: *(As noted in vanilla-tweaks discord server)
        - Wandering Trades (NOT Hermit Edition) for 1.21 includes Hermit heads.
        - The Wandering Trades data packs are missing the new 1.21 mini blocks that are added in our their Mini Blocks data pack.

<br>

- **Switched to Fabric?**<br>
    To hopefully be more performant aswell as stable i decided to migrate the server to fabric.
    
    This comes with a quite afew changes however:
    
    * Redstone is no-longer bound by *Paper* and functions like vanilla.
    * Alternatives to all plugins have been found but some functionality will
    be diffrent.
        
        - CustomMusicDiscs need to be migrated by an admin and/or me.
        - `/spin` is currently missing but sitting and crawling should work, albeight slight diffrent.
        - You can no longer fly with a leashed player.
        - Snowball/Egg knockback/damage is slightly different.

<br>

- **Server Maintenance**<br>
    Because of hosting issues partial-rollbacks have happened.
    I have tried to either recreate or re-add things, if important things are missing contact me.

    I did some light world-trimming in the overworld to bring down file size, *same applies here.*
<br><br>

## ClientSide

**Known Issues:**

No CIT/CustomItemTexture mod, neither `CitResewn` or `Chime` has updated to 1.21 at this point. This means *"rename to retexture/remodel"* resourcepack features are non-functioning.

The mod `RyoamicLights` has some issues with high amounts to GlowingItemFrames,
so it is disabled by default on BETA2, to disable it on BETA1:
1. Go into `Mods` menu by pressing ESC and clicking `Mods`.
2. Search `RyoamicLights` and press the *"Sliders-icon"* (Configure).
3. Click `Dynamic Lights` to `Off`.

And of course to enable it in BETA2 do the same but dont set it to `Off`.

### BETA2 Notes

<details>
    <summary>Mod Changes: (Since 1.20.4_Community_Client_Lite_U3)</summary>

    <span style="color:red;font-weight:bold;">Missing Mods:</span>
        - `BetterMountHUD`
        - `CitResewn`
        - `map-compass`
        - `MoreCulling`

    <span style="color:green;font-weight:bold;">New Mods:</span>
        - `Continuity`
        - `Indium` *(Fixes Continuity)*
        - `MapTooltip`
        - `NoTelemetry`
        - `BadHorseFix`
        - `ArmorChroma`
        - `BetterF3`
        - `GiveMeANewSplashText`
        - `HatList`
        - `HeyWiki`
        - `ModLoadingScreen`
        - `RealArrowTip`
        - `ScoreboardOverhaul`

    <span style="color:blue;font-weight:bold;">Alternatives:</span>
        - `beenfo` -> `Beehive Tooltip`
        - `lambdynamiclights` -> `RyoamicLights`
        - `midnightcontrols` -> `Controlify`

    <span style="color:orange;font-weight:bold;">Skipped:</span>
        - `map-in-slot`
        - `memoryleakfix`
        - `ModDetectionPreventer`
        - `suggestion-tweaker`
        - `threadtweak`
        <br>
</details>

### BETA1 Notes

<details>
    <summary>Mod Changes: (Since 1.20.4_Community_Client_Lite_U3)</summary>

    <span style="color:red;font-weight:bold;">Missing Mods:</span>
        - `Appleskin`
        - `BetterMountHUD`
        - `CitResewn`
        - `FerriteCore`
        - `Krypton`
        - `main-menu-credits`
        - `map-compass`
        - `MoreCulling`

    <span style="color:green;font-weight:bold;">New Mods:</span>
        - `Continuity`
        - `Indium` *(Fixes Continuity)*
        - `MapTooltip`
        - `NoTelemetry`

    <span style="color:blue;font-weight:bold;">Alternatives:</span>
        - `beenfo` -> `Beehive Tooltip`
        - `lambdynamiclights` -> `RyoamicLights`
        - `midnightcontrols` -> `Controlify`

    <span style="color:orange;font-weight:bold;">Skipped:</span>
        - `map-in-slot`
        - `memoryleakfix`
        - `ModDetectionPreventer`
        - `suggestion-tweaker`
        - `threadtweak`
        <br>
</details>
<br><br>

## Server Resource Pack
* Updated alot of non-player-accessible items to use vanillas `CustomModelData` instead of CIT.
* Forked MoreArmorTrims to include materials for the ´bolt´ and ´flow´ armor trims.
<br><br>

## Client Resource Pack
* Ported to 1.21
* Removed CEM glass-textures, might become sepparate pack later.
<br><br>

## What next?
Due to the mentioned server-hosting issues I will be looking into alternative hosting providers in the next comming days.