import fs from 'fs'
//获取文件真实类型
export const getFileMimeType = function(filePath) {
    try {
      var buffer = new Buffer(8)
      var fd = fs.openSync(filePath, 'r+');
      fs.readSync(fd, buffer, 0, 8, 0);
      var newBuf = buffer.slice(0, 4);
      var head_1 = newBuf[0].toString(16);
      var head_2 = newBuf[1].toString(16);
      var head_3 = newBuf[2].toString(16);
      var head_4 = newBuf[3].toString(16);
      var typeCode = head_1 + head_2 + head_3 + head_4;
      var filetype = '';
      var mimetype;
      switch (typeCode){
          case 'ffd8ffe1':
              filetype = 'jpg';
              mimetype = ['image/jpeg', 'image/pjpeg'];
              break;
          case '47494638':
              filetype = 'gif';
              mimetype = 'image/gif';
              break;
          case '89504e47':
              filetype = 'png';
              mimetype = ['image/png', 'image/x-png'];
              break;
          case '504b34':
              filetype = 'zip';
              mimetype = ['application/x-zip', 'application/zip', 'application/x-zip-compressed'];
              break;
          case '2f2aae5':
              filetype = 'js';
              mimetype = 'application/x-javascript';
              break;
          case '2f2ae585':
              filetype = 'css';
              mimetype = 'text/css';
              break;
          case '5b7bda':
              filetype = 'json';
              mimetype = ['application/json', 'text/json'];
              break;
          case '3c212d2d':
              filetype = 'ejs';
              mimetype = 'text/html';
              break;
          default:
              filetype = 'unknown';
              break;
      }
          fs.closeSync(fd);
      return {
          fileType : filetype,
          mimeType : mimetype
      }
    } catch (error) {
      console.log('@@@@@@@@@@@@@@@@@@@@@@@ ', error)
    }
}
