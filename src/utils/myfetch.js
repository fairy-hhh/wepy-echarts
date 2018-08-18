import wepy from 'wepy'
import 'wepy-async-function'
import {md5, calc_auth} from '@/utils/md5sign'
import {host} from '@/utils/host'

let {model, platform, system} = wx.getSystemInfoSync();

let base_params = {
    _app: 'zjapplet',
    _ch: 'applet',
    _ver: '1.0.0',
    _os: platform,
    _sys: system,
    _net: null,
};

export const networkType = async () => {
  let res = await wepy.getNetworkType()
  base_params._net = res.networkType
}

wx.onNetworkStatusChange({
    success: (res)=>{
        base_params._net = res.networkType;
    }
});


function updateCookie(cookie) {
  var parts = cookie.match(/[a-zA-Z0-9-]+=[^;=]*; expires=/g)
  var cookieStr = wx.getStorageSync('SS');
  var cookieArr = cookieStr && cookieStr.split('; ') || [];

  for (var i in parts) {
      var item = parts[i].substring(0, parts[i].indexOf(';')).trim();
      var prefix  = item.substring(0, item.indexOf('=') + 1);
      var val = item.substring(item.indexOf('=') + 1)
      var i;
      for (i = 0; i < cookieArr.length; ++i) {
        if (cookieArr[i].startsWith(prefix)) {
            break;
        }
      }
      cookieArr[i] = item;
  }
  wx.setStorageSync('SS', cookieArr.filter((i)=>{return !i.endsWith('=')}).join('; '));
}

export const GET = async (url, params)=>{
    var headers = {
      'Accept': 'application/json'
    };
    var SS = wx.getStorageSync('SS');
    if (SS) {
      headers['Cookie'] = SS;
    }
    Object.assign(headers, calc_auth('GET', url, params));
    Object.assign(params, base_params);
    const arr = Object.getOwnPropertyNames(params).map((name) => name + '=' + encodeURIComponent(params[name])); 
    var targetUrl = arr.length ? url + '?' + arr.join('&') : url;
    if (targetUrl[0] == '/') {
      targetUrl = host + targetUrl;
    }
    let {data, header} = await wepy.request({
        url: targetUrl,
        method: 'GET',
        header: headers
    });
    if (data.st != 'ok') {
        throw data.errinfo
    }
    if (header["Set-Cookie"]) {
        updateCookie(header["Set-Cookie"]);
    }
    return data
};

export const POST = async (url, params)=>{
    var headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    var SS = wx.getStorageSync('SS');
    if (SS) {
      headers['Cookie'] = SS;
    }
    Object.assign(headers, calc_auth('POST', url, params));
    Object.assign(params, base_params);
    const arr = Object.getOwnPropertyNames(params).map((name) => name + '=' + encodeURIComponent(params[name])); 
    var body = arr.join('&');
    if (url[0] == '/') {
      url = host + url;
    }
    let {data, header} = await wepy.request({
        url: url,
        method: 'POST',
        data: body,
        header: headers
    });
    if (data.st != 'ok') {
        throw data.errinfo
    }
    if (header["Set-Cookie"]) {
        updateCookie(header["Set-Cookie"]);
    }
    return data
};

export const UPLOAD = async (url, params) => {
  var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  };
  var SS = wx.getStorageSync('SS');
  if (SS) {
    headers['Cookie'] = SS;
  }
  Object.assign(headers, calc_auth('POST', url, params));
  Object.assign(params, base_params);
  if (url[0] == '/') {
    url = host + url;
  }
  var filePath = params.image.path;
  delete params.image;
  let {data, header} = await wepy.uploadFile({
    url: url,
    name: 'image',
    filePath: filePath,
    header: headers,
    formData: params
  });
  //data = JSON.parse(data)
  if (data.st != 'ok') {
      throw data.errinfo
  }
  return data
};
