const ostSettings = {};

ostSettings.actionPrettify = {
  'RewardHighlight': "adding an entity",
  'RewardSwitchPaper': "finishing a paper",
  'RewardRating': 'rating an entity'
}
ostSettings.walletPrettify = {
  'received': {
    'RewardHighlight': { 'verb': 'Rewarded', 'actionText': 'Added highlight' },
    'RewardSwitchPaper': { 'verb': 'Rewarded', 'actionText': 'Finished paper' },
    'RewardRating': { 'verb': 'Rewarded', 'actionText': 'Gave rating' },
    'AirdropCC': { 'verb': 'Airdropped', 'actionText': null },
    'SendGift': { 'verb': 'Received', 'actionText': 'Gift' }
  },
  'sent': {
    'RewardHighlight': { 'verb': 'Sent', 'actionText': 'Reward Highlight' },
    'RewardSwitchPaper': { 'verb': 'Sent', 'actionText': 'Reward Paper' },
    'RewardRating': { 'verb': 'Sent', 'actionText': 'Reward Rating' },
    'SendGift': { 'verb': 'Sent', 'actionText': 'Gift' },
  }
}

if (process.env.NODE_ENV === 'development') {
  ostSettings.ostDevMode = false
  ostSettings.contentCreators = ["e4da0842-d4bd-42eb-8eb3-af8bb524082a", "1d7e343b-121a-4a4e-9ecd-f474b68c0081", "cf233bee-6351-4a0a-8adf-29a76f6cefb2"]
}
else {
  ostSettings.ostDevMode = false
  // ostSettings.contentCreators = ["64193da3-95b9-4c27-8f20-afd118a0df70", "2de1db0c-749f-4927-875e-6e193d09abb7"]
  ostSettings.contentCreators = ["e4da0842-d4bd-42eb-8eb3-af8bb524082a", "1d7e343b-121a-4a4e-9ecd-f474b68c0081", "cf233bee-6351-4a0a-8adf-29a76f6cefb2"]

}

export default ostSettings;

