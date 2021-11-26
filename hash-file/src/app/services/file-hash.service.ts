import { Injectable } from '@angular/core';
import { FileHash } from '../model/file-hash.model.js';
import * as CryptoJS from 'crypto-js';
@Injectable({
  providedIn: 'root'
})
export class FileHashService {

  constructor() { }

  /**
   * This function hash a file with sha256
   * @param file 
   */
  hash(file: File, filePerso: FileHash) {
    // Start counter
    var startTime = performance.now()

    if (file) {

      let hasher = CryptoJS.algo.SHA256.create();

      let size = file.size;
      let chunk_size = Math.pow(2, 27);  //Best size found
      let offset = 0;


      let reader = new FileReader();

      reader.onload = async (e) => {
        if (reader.readyState == FileReader.DONE) {
          // Hash with sha256 from CryptoJS
          hasher.update(this.arrayBufferToWordArray(<ArrayBuffer>e.target.result));

          if (offset < size) {
            // Update offset for next slice
            offset += chunk_size;
            reader.readAsArrayBuffer(file.slice(offset, offset + chunk_size));
            filePerso.hash = Math.round((offset / size * 100)) + "/100%";
          } else {
            // If we are done, finalize the hash with all hash
            let hash = hasher.finalize().toString();
            filePerso.hash = hash;

            // Stop counter
            var endTime = performance.now()
            console.log(`Hash the file took ${endTime - startTime} milliseconds`)

            return;
          }
        }
      };
      // First call we get 0, chunck_size
      reader.readAsArrayBuffer(file.slice(offset, offset + chunk_size));
    }
  }

  private arrayBufferToWordArray(ab: ArrayBuffer) {
    var i8a = new Uint8Array(ab);
    // Extract bytes
    var words = [];
    for (var i = 0; i < i8a.length; i++) {
      words[i >>> 2] |= i8a[i] << (24 - (i % 4) * 8);
    }

    // Initialize this word array
    return CryptoJS.lib.WordArray.create(words, i8a.length);
  }
}