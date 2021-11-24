import { Component, OnInit } from '@angular/core';
import crypto from "../../../../node_modules/asmcrypto-lite/asmcrypto.js";
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { FileHash } from 'src/app/model/file-hash.model';
import { FileHashService } from 'src/app/services/file-hash.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {


  files: NgxFileDropEntry[] = [];
  filesInformation: FileHash[] = [];

  constructor(private fileHashService: FileHashService) { }

  ngOnInit(): void {
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;

    for (const droppedFile of files) {
      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {

          // Here you can access the real file
          console.log(droppedFile.relativePath, file);

          let filePerso = {
            name: file.name,
            lastModified: new Date(file.lastModified),
            size: file.size / 1000,
            hash: "calculating..."
          }
          this.fileHashService.hash(file, filePerso); //Hash the file

          this.filesInformation.push(filePerso);
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
  }

  public fileOver(event: Event) {
    console.log(event);
  }

  public fileLeave(event: Event) {
    console.log(event);
  }

}
