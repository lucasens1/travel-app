// Prendo Sequelize e DataTypes
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('travelapp', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    port: 8889
});

// User -> Tabella Users
const User = sequelize.define('User', {
    username : {
        type : DataTypes.STRING,
        allowNull : false,
        unique : true
    },
    email : {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password : {
        type : DataTypes.STRING,
        allowNull : false
    }
});

// Diary -> Tabella Diaries
const Diary = sequelize.define('Diary', {
    title : {
        type : DataTypes.STRING,
        allowNull : false
    },
    UserId: { // chiave esterna
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
})

// Modello Trip (Viaggio)
const Trip = sequelize.define('Trip', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    DiaryId: { // Aggiungi questo campo come chiave esterna
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Diary,
            key: 'id'
        }
    }
});

// Modello Day (Giorno)
const Day = sequelize.define('Day', {
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    latitude: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    longitude: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    photoUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    TripId: { //  chiave esterna
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Trip,
            key: 'id'
        }
    }
});

// Relazioni
User.hasMany(Diary);
Diary.belongsTo(User);

Diary.hasMany(Trip);
Trip.belongsTo(Diary);

Trip.hasMany(Day);
Day.belongsTo(Trip);

// Sincronizzazione con il database
sequelize.sync({ alter: true }).then(() => {
    console.log("Database & tables created!");
});

module.exports = { sequelize, User, Diary, Trip, Day };