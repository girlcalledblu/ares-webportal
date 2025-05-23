import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default Controller.extend({
  gameApi: service(),
  router: service(),
  
  @action     
  save() {
    let api = this.gameApi;
    api.requestOne('saveChannel', 
    {
      id: this.get('model.channel.id'),
      name: this.get('model.channel.name'), 
      desc: this.get('model.channel.desc'),
      can_talk: (this.get('model.channel.can_talk') || []),
      can_join: (this.get('model.channel.can_join') || []),
      discord_channel: this.get('model.channel.discord_channel'),
      discord_webhook: this.get('model.channel.discord_webhook'),
      color: this.get('model.channel.color')
    }, null)
    .then( (response) => {
      if (response.error) {
        return;
      }
      this.router.transitionTo('channels-manage');
      this.flashMessages.success('Channel updated!');
    });
  },
        
  @action
  talkRolesChanged(roles) {
    this.set('model.channel.can_talk', roles);
  },

  @action
  joinRolesChanged(roles) {
    this.set('model.channel.can_join', roles);
  }
    
});