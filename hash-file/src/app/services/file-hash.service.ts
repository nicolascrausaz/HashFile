import { Injectable } from '@angular/core';
import { FileHash } from '../model/file-hash.model.js';
@Injectable({
  providedIn: 'root'
})
export class FileHashService {

  constructor() { }

  /**
   * This function hash a file with sha256
   * Using Web Crypto API for file < FILESIZE
   * Using ASMCrypto.js for file >= FILESIZE
   * @param file 
   */
  hash(file: File, filePerso: FileHash) {
    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker(new URL('../worker/file-hash.worker', import.meta.url));
      worker.onmessage = ({ data }) => {
        filePerso.hash = data?.hash;
        //Check if we have the final hash
        if (data?.done) {
          console.log("Worker destroyed");
          worker.terminate();
        }
      };
      worker.postMessage({
        file: file
      });
    } else {
      // Web workers are not supported in this environment.
      console.log("Worker cannot be used");
    }
  }
}
