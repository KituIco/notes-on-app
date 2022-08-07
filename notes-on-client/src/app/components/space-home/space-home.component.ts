import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms'

import { WorkspaceService } from 'src/app/services/workspace.service';
import { PageService } from 'src/app/services/page.service';
import { Workspace } from 'src/app/interfaces/workspace';

@Component({
  selector: 'app-space-home',
  templateUrl: './space-home.component.html',
  styleUrls: ['./space-home.component.css']
})
export class SpaceHomeComponent implements OnInit {

  workspace!: Partial<Workspace>;

  form: FormGroup = this.formBuilder.group({
    cover: new FormControl(''),
    icon: new FormControl(''),
  })

  month: string[] = [" ","January","February","March","April","May",
    "June","July","August","September","October","November","December"]

  constructor(
    private pageService: PageService,
    private workspaceService: WorkspaceService,
    private formBuilder: FormBuilder,
    private cdref: ChangeDetectorRef,
  ) {
    this.workspaceService.onSpace$.subscribe((space) => {
      this.workspace = space;
    })
  }

  ngOnInit(): void {
    this.pageService.onChange({title: ""})
  }

  onCoverSelect($event: Event){
    const file = ($event.target as HTMLInputElement).files![0];
    this.form.get('cover')!.patchValue( file );

    const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"]
    if (file && allowedMimeTypes.includes(file.type)) {
      let formData = { "cover": this.form.get('cover')!.value };
      const wsid = this.workspace.workspaceId!;
      this.workspaceService.patchSpaceCover(formData,wsid).subscribe(() => {
        this.pageService.onChange({title: ""})
        this.cdref.detectChanges();
      });
    }
  }

  onIconSelect($event: Event){
    const file = ($event.target as HTMLInputElement).files![0];
    this.form.get('icon')!.patchValue( file );

    const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"]
    if (file && allowedMimeTypes.includes(file.type)) {
      let formData = { "icon": this.form.get('icon')!.value };
      const wsid = this.workspace.workspaceId!;
      this.workspaceService.patchSpaceIcon(formData,wsid).subscribe(() => {
        this.pageService.onChange({title: ""})
        this.cdref.detectChanges();
      });
    }
  }

  formatDate(creationDate: string): string {
    let date = creationDate.split("T")[0].split("-");
    return `${this.month[parseInt(date[1])]} ${date[2]}, ${date[0]}`
  }

  formatPage(total: number): string {
    if (total > 1) return `${total} pages`
    else return `${total} page`
  }

}
