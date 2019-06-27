<img src=http://u.cubeupload.com/Owyn/lilbaha.jpg>

# pet-skin-replacer
Customize your pet's appearance

## Info
- Creatures not used as pets normally have collision, to avoid bumping into them in combat use `pet stay` option (then even using Leaping Strike right into pet's face won't hinder your movement)   
- Feel free to use info in `DC` folder to find more `huntingZoneId` and `templateId` to set from any existing creatures out there  
- Module is client-side only, that means only you can see the difference. Nobody else can see your new pet.	

## Usage
### `pet`
- Toggle on/off
### `pet ?`
- Outputs a list of available pet presets
### `pet set [preset_name]`
- Set your pet from a preset. (Example: `pet set felicity` will make your pet into a white cat with a flower on its head!)
### `pet setid [huntingZoneId][templateId]`
- Set your pet from any NPC model. You need to know the templateId and huntingZoneId though. (eg `pet set id 983 950` to summon goddess Velik herself from the very heavens)
### `pet save`
- Saves current pet configuration into a per-character savefile which would get loaded next time you login onto this character
### `pet reload`
- Reloads current pet configuration from a per-character savefile (or resets to default if it doesn't exist)
### `pet size [size]`
- Sets pet size (eg `pet size 1.5` to make it 50% bigger or `0.1` to make it 10x times smaller)
### `pet name [name]`
- Sets pet name to one specified
### `pet move [number]`
- Set movement type for your pet (some NPCs and monsters might have multiple types of animations you can choose from):
```
-1 = copy players movetype (eg jump when you jump etc) (works only with "pet stay" option enabled),
0 = running, 1 = walking, 2 = falling, 5 = jumping,
6 = jump intersection and end when something is blocking the path and the player can't travel in the X and Y axis
7 = stop moving, landing, 8 = swimming, 9 = stop swimming, 10 = falling after jumping
```
### `pet stay [degrees] [distance]`
- Set pet to stay near you at [distance] units away at [degrees] degrees (eg `90` degrees - is at right, `-90` is at left, `180` is in the back)

## Presets

| Partners | Rare Pets      | Critters | Usual Pets | Monsters     |
|:---------|:---------------|:---------|:-----------|:-------------|
| Loo      | Mushroom       | Bunny    | Pixie      | Pooky        |
| Mary     | Slime          | Puppy    | Miss Kitty | Tuwangi      |
| Kuncun   | Cat            | Dog      | Juicy      | Mewy         |
| Cocomin  | Hanami         | Goat     | Candy      | Dahlia       |
|          | Baldi          | Pig      | Prince     | Pumpkin      |
|          | Durion         | Rooster  |            | Okami        |
|          | Sheep          | Pidgeon  |            | Lilith       |
|          | Felicity       |          |            | Bahaar       |
|          | Moon Bunny     |          |            | Imperator    |
|          | Miss Katonic   |          |            | Darkan       |
|          |                |          |            | Kylos        |
|          |                |          |            | Mystel       |
|          |                |          |            | Lizard       |
|          |                |          |            | Bandersnatch |

<img src=http://u.cubeupload.com/Owyn/petspreview.jpg>