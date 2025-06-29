import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default Controller.extend({    
    gameApi: service(),
    flashMessages: service(),
    router: service(),
  
    /* See note in chargen-char about how this callack is wired up. */
    customUpdateCallback: null,
  
    buildQueryDataForChar: function() {
      
        let custom = this.customUpdateCallback ? this.customUpdateCallback() : null;
      
        let demographics = {};
        let profile = {};
        let relationships = {};
        let descs = {};
        
        let demo_entry = this.get('model.char.demographics');
        Object.keys(demo_entry).forEach(function(k) {
            demographics[k] = demo_entry[k].value;
        });

        this.get('model.char.profile').forEach(function(p) {
            profile[p.name] = p.text;
        });
        
        this.get('model.char.relationships').forEach(function(r) {
            relationships[r.name] = { text: r.text, 
              order: r.order, 
              category: r.category,
              is_npc: r.is_npc,
              npc_image: r.is_npc ? r.npc_image : null };
        });
        
        
        descs['current'] = this.get('model.char.descs.current');
        descs['short'] = this.get('model.char.shortdesc');
        descs['outfits'] = {};
        descs['details'] = {};
        this.get('model.char.descs.outfits').forEach(function(p) {
            descs['outfits'][p.name] = p.desc;
        });
        this.get('model.char.descs.details').forEach(function(p) {
            descs['details'][p.name] = p.desc;
        });
        
        let roster = {
          on_roster: this.get('model.char.roster.on_roster'),
          restricted: this.get('model.char.roster.restricted'),
          contact: this.get('model.char.roster.contact'),
          played: this.get('model.char.roster.played'),
          notes: this.get('model.char.roster.notes')
        };
                        
        return { 
            id: this.get('model.char.id'),
            demographics: demographics,
            rp_hooks: this.get('model.char.rp_hooks'),
            relationships: relationships,
            relationships_category_order: this.get('model.char.relationships_category_order'),
            profile: profile,
            bg_shared: this.get('model.char.bg_shared'),
            lastwill: this.get('model.char.lastwill'),
            idle_notes: this.get('model.char.idle_notes'),
            profile_image: this.get('model.char.profile_image.name'),
            profile_icon: this.get('model.char.profile_icon.name'),
            profile_gallery: this.get('model.char.profile_gallery'),
            profile_order: this.get('model.char.profile_order'),
            background: this.get('model.char.background'),
            rp_prefs: this.get("model.char.rp_prefs"),
            tags: this.get('model.char.tags'),
            fs3: this.get('model.char.fs3'),
            descs: descs,
            custom: custom,
            roster: roster,
            roles: this.get('model.char.roles') || []
        };
    }, 
        
    @action
    save() {
        if (this.get('model.char.profile').filter(p => p.name.length == 0).length > 0) {
            this.flashMessages.danger('Profile names cannot be blank.');
            return;
        }
        
        if (this.get('model.char.relationships').filter(r => r.name.length == 0).length > 0) {
            this.flashMessages.danger('Relationship names cannot be blank.');
            return;
        }
        
        if (this.get('model.char.descs.outfits').filter(r => r.name.length == 0).length > 0) {
            this.flashMessages.danger('Outfit names cannot be blank.');
            return;
        }
        
        if (this.get('model.char.descs.outfits').filter(r => r.name.includes(' ')).length > 0) {
            this.flashMessages.danger('Outfit names cannot contain spaces.');
            return;
        }

        if (this.get('model.char.descs.details').filter(r => r.name.length == 0).length > 0) {
            this.flashMessages.danger('Detail names cannot be blank.');
            return;
        }
        
        let api = this.gameApi;
        api.requestOne('profileSave', this.buildQueryDataForChar(), null)
        .then( (response) => {
            if (response.error) {
                return;
            }
        
            this.flashMessages.success('Saved!');
            this.router.transitionTo('char', this.get('model.char.name'));
            
        });
    }
});