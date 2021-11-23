import { Injectable } from '@angular/core';
import Crypto from "../../../node_modules/asmcrypto-lite/asmcrypto.js";
import { FileHash } from '../model/file-hash.model.js';
@Injectable({
  providedIn: 'root'
})
export class FileHashService {

  constructor() { }

  /**
   * This function hash a file with sha256
   * @param file 
   * @returns 
   */
  hash(file: File, filePerso: FileHash) {
    let hash = "TEMP";
    let hasher = new Crypto.SHA256();
    if (file) {
      let size = file.size;
      let chunk_size = Math.pow(2, 27);
      let offset = 0;

      let reader = new FileReader();

      reader.onload = (e) => {
        if (reader.readyState == FileReader.DONE) {
          // Hash with sha256 from asmCrypto
          let uint8_data = new Uint8Array(<ArrayBuffer>e.target.result);
          hasher.process(uint8_data);

          if (offset < size) {
            // Update offset for next slice
            offset += chunk_size;
            reader.readAsArrayBuffer(file.slice(offset, offset + chunk_size));
          } else {
            // If we are done, finalize the hash with all hash
            hasher.finish();
            hash = this.bytes_to_hex(hasher.result)
            console.log("Hash", hash);
            filePerso.hash = hash;
            return;
          }
        }
      };
      // First call we get 0, chunck_size
      reader.readAsArrayBuffer(file.slice(offset, offset + chunk_size));
    }
  }



  private bytes_to_hex(arr: Uint8Array) {
    var str = '';
    for (var i = 0; i < arr.length; i++) {
      var h = (arr[i] & 0xff).toString(16);
      if (h.length < 2) str += '0';
      str += h;
    }
    return str;
  }
}
