import { Injectable } from '@angular/core';
import { FileHash } from '../model/file-hash.model.js';
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
      let size = file.size;
      let chunk_size = Math.pow(2, 27);  //Best size found
      let offset = 0;

      let allHash = [];

      let reader = new FileReader();

      reader.onload = async (e) => {
        if (reader.readyState == FileReader.DONE) {
          // Hash with sha256 from asmCrypto
          let uint8_data = new Uint8Array(<ArrayBuffer>e.target.result);

          const hashCrypto = await crypto.subtle.digest('SHA-256', uint8_data);
          const hashArray = Array.from(new Uint8Array(hashCrypto));  // convert buffer in octet array
          console.log(hashArray);
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert byte to hex
          allHash.push(hashHex);

          if (offset < size) {
            // Update offset for next slice
            offset += chunk_size;
            reader.readAsArrayBuffer(file.slice(offset, offset + chunk_size));
          } else {
            // If we are done, finalize the hash with all hash
            allHash.pop();  //Remove the last one because non part of the file

            // If we have only one hash no need to hash it again
            if (allHash.length === 1) {
              filePerso.hash = allHash.pop();
            } else {
              const hashCrypto = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(allHash.join())); // Hash all the hash
              const hashArray = Array.from(new Uint8Array(hashCrypto));  // convert buffer in octet array
              const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');  // convert byte to hex
              filePerso.hash = hashHex;
            }

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
}
