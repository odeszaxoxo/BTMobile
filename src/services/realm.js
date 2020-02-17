import Realm from 'realm';

class Event extends Realm.Object {}
Event.schema = {
  name: 'EventItem',
  properties: {
    title: 'string',
    scene: 'int',
    time: 'string',
    date: 'string',
    id: 'int',
  },
  primaryKey: 'id',
};

class Scene extends Realm.Object {}
Scene.schema = {
  name: 'Scene',
  primaryKey: 'id',
  properties: {selected: 'bool', id: 'int', title: 'string', color: 'string'},
};

class Selected extends Realm.Object {}
Selected.schema = {
  name: 'Selected',
  properties: {selected: 'string', id: 'int'},
  primaryKey: 'id',
};

export default new Realm({
  schema: [Event, Scene, Selected],
});
