const   path = require('path'),
		fs = require('fs');
		
const pets_presets = JSON.parse(fs.readFileSync(path.join(__dirname, './pet_presets.json'), "utf8"));

const default_settings = {templateId: 0,
					huntingZoneId: 0,
					size: 0,
					move: 0,
					stay: [],
					name: ""}

module.exports = function PetReplacer(mod) {
    const command = mod.command;
    
    let hooks = [],
		enabled = true,
		settingsFileName = "",
		petId = 0n,
		myId = 0n,
		pWalkSpeed = 0,
		pRunSpeed = 0,
		pIsWalking = 0,
		timer = null,
		prevAngle = null,
		prevType = 0,
		PetActualAngle = 0,
		settings = {};
         
    mod.hook('S_REQUEST_SPAWN_SERVANT', 1, {order: 9999}, (event) => {
        if (!enabled || event.ownerId !== myId) return;
		
		petId = event.gameId;
		if(settings.templateId) {event.linkedNpcTemplateId = settings.templateId;}
		if(settings.huntingZoneId) {event.linkedNpcHuntingZoneId = settings.huntingZoneId;}
		if(settings.name) {event.name = settings.name;}
		if(settings.size) {setTimeout(setSize, 10);}
		if(!hooks.length)
		{
			if(settings.stay.length)
			{
				hook('S_NPC_LOCATION', 3, {order: 9999}, (ev) => {
					if (ev.gameId === petId) return false;
				});
				PetActualAngle = settings.stay[0];
				hook('C_PLAYER_LOCATION', 5, {order: 9999, filter: {fake: null}}, moveAlongHook);
				hook('C_START_TARGETED_SKILL', 6, {order: 9999, filter: {fake: null}}, moveAlongHook);
				hook('S_ACTION_STAGE', 9, {order: 9999, filter: {fake: null}}, moveAlongHook);
				hook('S_ACTION_END', 5, {order: 9999, filter: {fake: null}}, moveAlongHook);
				hook('S_INSTANT_DASH', 3, {order: 9999, filter: {fake: null}}, (ev) => {
					ev.dest = ev.loc;
					moveAlongHook(ev);
				});
			}
			else if (settings.move)
			{
				hook('S_NPC_LOCATION', 3, {order: 9999}, (ev) => {
					if (ev.gameId === petId)
					{
						ev.type = settings.move;
						return true;
					}
				});
			}
		}
		return true;
    });
	
	function moveAlongHook(ev)
	{
		if(ev.gameId)
		{
			switch(ev.gameId)
			{
				case myId:
					break;
				case petId:
					ev.loc = calc_pos(ev.loc, ev.w, PetActualAngle, settings.stay[1]);
					ev.w = prevAngle;
					return true;
				default:
					return;
			}
		}
		
		if(!ev.dest || !ev.dest.x) return;
		
		let jumpInPlace = false;
		if(ev.type !== undefined)
		{
			if(ev.type === 5 || (prevType === 5 && ev.type === 7))
			{
				if(ev.loc.x === ev.dest.x && ev.loc.y === ev.dest.y)
				{
					jumpInPlace = true;
				}
			}
			else
			{
				if(ev.type === 1 || ev.type === 0)
				{
					pIsWalking = ((ev.type === 1) ? true : false);
				}
				if(!ev.afk) { ev.dest.z += 90; } // spiderhorse
			}
			prevType = ev.type;
		}
		let Speed = (jumpInPlace ? 0 : (pIsWalking ? pWalkSpeed : pRunSpeed));
		if(ev.stage === 0) { Speed = 800; } // leaping strike no bump now
		let AngleDif = (prevAngle !== null) ? radians_to_degrees(DeltaAngle(prevAngle, ev.w)) : 0;
		let prevStep = PetActualAngle;
		PetActualAngle = sub_degrees(PetActualAngle, AngleDif);
		let PetCorrectionStep = (sub_degrees(settings.stay[0], PetActualAngle) > 0) ? -15 : 15;
		let nextStep = sub_degrees(PetActualAngle, PetCorrectionStep);
		if(Math.abs(sub_degrees(settings.stay[0], nextStep)) > Math.abs(PetCorrectionStep))
		{
			PetActualAngle = nextStep;
			if(!ev.afk) { Speed+=40; clearTimeout(timer); timer = mod.setTimeout(hasPlayerStopped, 1000, ev); }
		}
		else
		{
			PetActualAngle = settings.stay[0];
			clearTimeout(timer);
		}
		mod.send('S_NPC_LOCATION', 3, {
			gameId: petId,
			w: ev.w,
			speed: Speed,
			type: (settings.move === -1) ? ev.type : settings.move,
			loc: calc_pos(ev.loc, ev.w, prevStep, settings.stay[1]),
			dest: calc_pos(ev.dest, ev.w, PetActualAngle, settings.stay[1])
		});
		prevAngle = ev.w;
		//SpawnThing(ev.loc, ev.w, prevStep, settings.stay[1], "FROM");
		//SpawnThing(ev.dest, ev.w, PetActualAngle, settings.stay[1], "TO");
	}
	
	function hasPlayerStopped(ev)
	{
		ev.afk = true;
		ev.loc = ev.dest; // fix for long-range movement skills
		timer = mod.setInterval(moveAlongHook, 100, ev); //ok so I've just made it super-fast cuz this lil shit wont run ani
	}
	
	/*let uid = 9999945645;
	function SpawnThing(loc, w, degrees, radius, text)
	{
		let r = null, rads = null, finalrad = null, pos = {};
		r = w - Math.PI;
		rads = (degrees * Math.PI/180);
		finalrad = r - rads;
		pos.x = loc.x + radius * Math.cos(finalrad);
		pos.y = loc.y + radius * Math.sin(finalrad);
		pos.z = loc.z;
		
		mod.toClient('S_SPAWN_BUILD_OBJECT', 2, {
			gameId : uid,
			itemId : 1,
			loc : pos,
			w : r,
			unk : 0,
			ownerName : text,
			message : text
		});
		
		setTimeout(DespawnThing, 400, uid);
		uid--;
	}
	
	function DespawnThing(uid_arg)
	{
		mod.toClient('S_DESPAWN_BUILD_OBJECT', 2, {
				gameId : uid_arg,
				unk : 0
			});
	}*/
	
	 mod.hook('S_REQUEST_DESPAWN_SERVANT', 1, (event) => {
        if (event.gameId === petId)
		{
			petId = 0n;
			unload();
		}
    });
	
	mod.hook('S_PLAYER_STAT_UPDATE', 12, {order: 9999}, (ev) => {
			pWalkSpeed = ev.walkSpeed + ev.walkSpeedBonus;
			pRunSpeed = ev.runSpeed + ev.runSpeedBonus;
		});
	
	function DeltaAngle(x,y) { return Math.atan2(Math.sin(x-y), Math.cos(x-y)); }
	
	function sub_degrees(a,b)
	{
		let res = a-b;
		while(res <= -180) res = 360 + res;
		while(res > 180) res = res - 360;
		return res;
	}
	
	function radians_to_degrees(radians)
	{
	  return radians * (180/Math.PI);
	}
	
	function calc_pos(loc, w, degrees, radius)
	{
		let r = null, rads = null, finalrad = null, pos = {};
		r = w - Math.PI;
		rads = (degrees * Math.PI/180);
		finalrad = r - rads;
		pos.x = loc.x + radius * Math.cos(finalrad);
		pos.y = loc.y + radius * Math.sin(finalrad);
		pos.z = loc.z;
		return pos;
	}

	function setSize()
	{
		if(!petId) return;
		
		mod.send('S_ABNORMALITY_SCALE_UP', 2, {
				gameId: petId,
				scale: settings.size,
				duration: 0
		});
	}
	
	function unload() {
		if(hooks.length) {
			for(let h of hooks) mod.unhook(h);

			hooks = [];
		}
	}

	function hook() {
		hooks.push(mod.hook(...arguments));
	}
		
	function saveJson(obj)
	{
		if (Object.keys(obj).length)
		{
			command.message('Saving current characters pet settings to a file...');
			try
			{
				fs.writeFileSync(path.join(__dirname, settingsFileName), JSON.stringify(obj, null, "\t"));
				command.message('Saved');
			}
			catch (err)
			{
				console.log(err);
				return false;
			}
		}
	}

	function loadJson()
	{
		try
		{
			return JSON.parse(fs.readFileSync(path.join(__dirname, settingsFileName), "utf8"));
		}
		catch (err)
		{
			return default_settings;
		}
	}
	
	if(!fs.existsSync(path.join(__dirname, './saves')))
	{
		fs.mkdirSync(path.join(__dirname, './saves'));
	}
	
	mod.hook('S_LOGIN', 13, e=> {
			settingsFileName = `./saves/${e.name}-${e.serverId}.json`;
			settings = loadJson();
			myId = e.gameId;
	});
    
	command.add(['pet', '!pet'], {
        $none() {
            enabled = !enabled;
			command.message((enabled ? 'Enabled' : 'Disabled'));
		},
		$default() {
			command.message('See README for the list of valid commands');
			let message = 'Available pet presets: ';
            for (let i = 0; i < pets_presets.pets.length; i++) {
                message += pets_presets.pets[i].name[0].toUpperCase() + pets_presets.pets[i].name.slice(1) + ', ';
            }            
            command.message(message);
		},
		name(arg) {
			if(arg)
			{
				settings.name = arg;
				command.message("pet name set to " + arg);
			}
			else
			{
				settings.name = "";
				command.message("pet name set to default (real one)");
			}
		},
		size(arg) {
			if(arg)
			{
				settings.size = Number(arg);
				command.message("pet size set to " + arg);
			}
			else
			{
				settings.size = 0;
				command.message("pet size set to default (1.0)");
			}
			setSize();
		},
		move(arg) {
			if(arg)
			{
				settings.move = Number(arg);
				command.message("pet movetype set to: " + arg);
			}
			else
			{
				settings.move = 0;
				command.message("pet movetype set to default (run)");
			}
		},
		stay(arg1, arg2) {
			if(arg1 && arg2)
			{
				settings.stay = [Number(arg1), Number(arg2)];
				command.message("pet would now stay "+ arg2 +" units away from you at " + arg1 + " degrees");
			}
			else
			{
				settings.stay = [];
				command.message("pet wont stay near you from now now (default)");
			}
		},
		set(arg) {
			arg = arg.toLowerCase();
			for (let i = 0; i < pets_presets.pets.length; i++) {
				if (pets_presets.pets[i].name == arg) {
					settings.templateId = pets_presets.pets[i].templateId;
					settings.huntingZoneId = pets_presets.pets[i].huntingZoneId;
					settings.size = pets_presets.pets[i].size || 0;
					settings.stay = pets_presets.pets[i].stay || settings.stay;
					settings.move = pets_presets.pets[i].move || settings.move;
					command.message('Pet set to \'' + arg[0].toUpperCase() + arg.slice(1) + '\'');
					return;
				}
			}
			command.message('Could not find pet preset named \'' + arg + '\'');
		},
		setid(arg1, arg2) {
			if(arg1 && arg2)
			{
				settings.huntingZoneId = Number(arg1);
				settings.templateId = Number(arg2);
				command.message('huntingZoneId set to ' + arg1 + ', templateId to ' + arg2);
			}
			else
			{
				settings.huntingZoneId = 0;
				settings.templateId = 0;
				command.message('huntingZoneId set to default (no replace)');
			}
		},
		save() {
			saveJson(settings);
		},
		reload() {
			settings = loadJson();
			command.message('Reloaded settings');
		}
	});
}