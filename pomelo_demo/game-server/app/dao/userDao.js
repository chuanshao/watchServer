/**
 * Created by DELL on 2017/3/17.
 */
var pomelo = require('pomelo');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userDao = module.exports;
var ObjectId = Schema.ObjectId;
var ErrorCode = require('../../../shared/code');
var userSchema = new Schema({
    user_id:{type : ObjectId},
    account:{type : String},
    nickname : {type : String },
    password : {type : String},
    phoneNum : {type:Number},
    gender : {type : Number , default:0},
    gold:{type : Number , default:0}
});
var userModel = mongoose.model('user' , userSchema);
//通过用户名获取一个玩家信息
userDao.getUserInfo = function(account  , cb)
{
    getUserInfoByAccount(account , cb);
}
/*
* 更新用户数据
* */
userDao.updateUser = function(userUid , updateUserData , cb)
{

}
/*
* 创建新用户
* */
userDao.createUser = function(account , passwd , cb)
{
    getUserInfoByAccount(account , function(err , res){
        if(err || res.length == 0)//用户不存在  允许创建用户
        {
            var newUserField = getDefaultUserConfig(account , passwd , 13636477476 , "吉昌");
            newUserField.save(function(err , res){
                if(err){
                    cb(ErrorCode.USER.CREATE_USER_FAIL , null);
                }else{
                    cb(null , res);
                }
            });
            // userModel.create(newUserField , function(err , res){
            //     if(err){
            //         cb(ErrorCode.USER.CREATE_USER_FAIL , null);
            //     }else{
            //         cb(null , res);
            //     }
            // });
        }else
        {
            cb(ErrorCode.USER.USER_EXIST , null);//该用户已经存在
        }
    });
}

userDao.getUserInfoById = function(userId , cb)
{
    userModel.findById(userId , function(err , res){
        if(err|| res.length  == 0) {
            cb(ErrorCode.USER.NO_USER , null);//该用户不存在
        }else {
            cb(null , res);
        }
    });
}
function getUserInfoByAccount(account , cb)
{
    var criteria = {account : account ,  "account" : { "$exists" : true } };
    userModel.find(criteria , function(err , res){
        if(err || res.length  == 0)
        {
            cb(ErrorCode.USER.NO_USER , null);//该用户不存在
        }else
        {
            cb(null , res);
        }
    });
}
function getDefaultUserConfig(account , passwd , phonenb , nickname)
{
    return new userModel( {account:account , password:passwd ,phoneNum:phonenb ,nickname:nickname ,gender: 0,gold:0});
}