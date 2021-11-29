import { Injectable } from '@angular/core';
import Crypto from "../../../node_modules/asmcrypto-lite/asmcrypto.js";
import { FileHash } from '../model/file-hash.model.js';
@Injectable({
  providedIn: 'root'
})
export class FileHashService {

  constructor() { }

  readonly FILESIZE: number = 1000000000  ; // 1GB
  readonly CHUNKSIZE: number = Math.pow(2, 28); //Best result found

  /**
   * This function hash a file with sha256
   * Using Web Crypto API for file < FILESIZE
   * Using ASMCrypto.js for file >= FILESIZE
   * @param file 
   */
  hash(file: File, filePerso: FileHash) {
    if (file) file.size < this.FILESIZE ? this.hashSmallFile(file, filePerso) : this.hashBigFile(file, filePerso);
  }

/**
 * This function hashes file using CryptoWeb
 */
  hashSmallFile(file: File, filePerso: FileHash) {
    // Start counter
    var startTime = performance.now()

    let chunk_size = this.FILESIZE;
    let offset = 0;

    let reader = new FileReader();

    reader.onload = async (e) => {
      if (reader.readyState == FileReader.DONE) {
        let uint8_data = new Uint8Array(<ArrayBuffer>e.target.result);

        const hashCrypto = await crypto.subtle.digest('SHA-256', uint8_data); // hash file in one time with Javascript Crypto Web API
        const hashArray = Array.from(new Uint8Array(hashCrypto));  // convert buffer in octet array
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert byte to hex

        filePerso.hash = hashHex;

        // Stop counter
        var endTime = performance.now()
        console.log(`Hash the file took ${endTime - startTime} milliseconds (small file)`)

        return;

      }
    };
    // First call we get 0, chunck_size
    reader.readAsArrayBuffer(file.slice(offset, offset + chunk_size));


  }

  /**
   * This function hashes file using ASMCrypto.js
   */
  hashBigFile(file: File, filePerso: FileHash) {
    // Start counter
    var startTime = performance.now()

    let hasher = new Crypto.SHA256();
    let size = file.size;
    let chunk_size = this.CHUNKSIZE;
    let offset = 0;

    let reader = new FileReader();

    reader.onload = (e) => {
      if (reader.readyState == FileReader.DONE) {
        // Hash with sha256 from asmCrypto
        let uint8_data = new Uint8Array(<ArrayBuffer>e.target.result);
        hasher.process(uint8_data);  //Hash the partial file

        if (offset < size) {
          // Update offset for next slice
          offset += chunk_size;
          reader.readAsArrayBuffer(file.slice(offset, offset + chunk_size));
          filePerso.hash = Math.round((offset / size * 100)) + "/100%";
        } else {
          // If we are done, finalize the hash with all hash
          hasher.finish();
          let hash = this.bytes_to_hex(hasher.result)

          // Stop counter
          var endTime = performance.now()
          console.log(`Hash the file took ${endTime - startTime} milliseconds (large file)`)

          filePerso.hash = hash;
          return;
        }
      }
    };
    // First call we get 0, chunck_size
    reader.readAsArrayBuffer(file.slice(offset, offset + chunk_size));

  }

  // Private methode to convert ann Uint8Array of byte to a string of hexadecimal values
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
