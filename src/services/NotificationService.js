import PushNotification from 'react-native-push-notification';

export default class NotificationService {
  constructor(onRegister, onNotification) {
    this.configure(onRegister, onNotification);

    this.lastId = 0;
  }

  configure(onRegister, onNotification, gcm = '') {
    PushNotification.configure({
      onRegister: onRegister,
      onNotification: onNotification,

      senderID: gcm,

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,

      requestPermissions: true,
    });
  }

  scheduleNotif(testDate, title, message, notifId) {
    this.lastId++;
    var identificator = '99' + notifId.toString();
    PushNotification.localNotificationSchedule({
      //date: new Date(Date.now() + 10 * 1000), // test time 10 sec
      date: testDate,
      /* Android Only Properties */
      id: identificator, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
      ticker: 'My Notification Ticker', // (optional)
      autoCancel: true, // (optional) default: true
      largeIcon: 'ic_launcher', // (optional) default: "ic_launcher"
      smallIcon: 'ic_notification', // (optional) default: "ic_notification" with fallback for "ic_launcher"
      bigText: message,
      color: 'blue', // (optional) default: system default
      vibrate: true, // (optional) default: true
      vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
      group: 'group', // (optional) add group to message
      ongoing: false, // (optional) set whether this is an "ongoing" notification

      /* iOS only properties */
      alertAction: 'view', // (optional) default: view
      category: '', // (optional) default: empty string
      userInfo: {id: identificator}, // (optional) default: {} (using null throws a JSON value '<null>' error)

      /* iOS and Android properties */
      title: title, // (optional)
      message: message, // (required)
      playSound: true, // (optional) default: true
      soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
    });
  }

  checkPermission(cbk) {
    return PushNotification.checkPermissions(cbk);
  }

  cancelNotif(get) {
    PushNotification.cancelLocalNotifications({get});
  }

  cancelAll() {
    PushNotification.cancelAllLocalNotifications();
  }
}
