import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormControl, FormGroup, NgForm, Validators } from "@angular/forms";

import { WorkspaceService } from 'src/app/services/workspace.service';
import { PageService } from 'src/app/services/page.service';
import { Workspace } from 'src/app/interfaces/workspace';
import { Page, Search } from 'src/app/interfaces/page';

import { Observable, of, Subject } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { SocketService } from 'src/app/services/socket.service';


@Component({
  selector: 'app-space-detail',
  templateUrl: './space-detail.component.html',
  styleUrls: ['./space-detail.component.css'],
})
export class SpaceDetailComponent implements OnInit {
  @ViewChild("spaceDirective") spaceDirective!: NgForm;
  spaceform: FormGroup = this.createSpaceForm();

  workspace!: Workspace;
  workspaces: Workspace[] = [];
  pages: Page[] = [];
  curpage!: Partial<Page>;
  pagelink!: string;

  searchResults$: Observable<Search[]>;
  term$ = new Subject<string>();

  shared = false;
  opened = true;

  @HostListener("window:resize", []) updateOpened() {
    if (window.innerWidth < 1260) {
      this.opened = false;
    } else {
      this.opened = true;
    }
  }

  constructor(
    private route: ActivatedRoute,
    private workspaceService: WorkspaceService,
    private pageService: PageService,
    private socketService: SocketService,
  ) { 
    this.pageService.changePage$.subscribe((page) => {
      this.curpage = page; 
      this.shared = this.curpage.shared ? this.curpage.shared: false;
      this.pagelink = `localhost:4200/pages/${this.curpage.pageId}`;
      this.getWorkspace();
    })

    this.searchResults$ = this.term$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((term) => 
        term.length == 0 ? of([]) : this.pageService.searchPage(this.workspace.workspaceId, term) 
      ),
    );
  }

  ngOnInit(): void {
    this.getWorkspace();
    this.route.url.subscribe(()=>{
      if(this.workspace) this.getPages();
      this.curpage = {title: ""};
    }); 
    if (window.innerWidth < 1260) {
      this.opened = false;
    }
  }

  getWorkspace(): void {
    const id = this.route.snapshot.paramMap.get('workspaceId')
    if(id)
      this.workspaceService.getWorkspace(id)
        .subscribe(workspace => {
          this.workspace = workspace;
          this.workspaceService.onSpace(this.workspace);
          this.getPages();
        });
  }

  getUserSpaces(): void {
    this.workspaceService.getUserSpaces(this.workspace.userId)
      .subscribe(workspaces => this.workspaces = workspaces);
  }

  formatDate(creationDate: string): string {
    let date = creationDate.split("T")[0];
    let time = creationDate.split("T")[1].split(".")[0];
    return `${date} ${time}`
  }

  createSpaceForm(): FormGroup {
    // do not allow strings to contain only white spaces
    return new FormGroup({
      title: new FormControl("",[Validators.maxLength(60)]),
      description: new FormControl("",[Validators.maxLength(250)]),
      order: new FormControl("")
    });
  }

  onSubmit(formData: Pick<Workspace, "title"|"description"|"order">): void {
    if(!formData.title) formData.title = this.workspace.title;
    if(!formData.description) formData.description = this.workspace.description;
    if(!formData.order) formData.order = this.workspace.order; 
    const id = this.route.snapshot.paramMap.get('workspaceId');
    if(id)
      this.workspaceService.patchWorkspace(formData,id).subscribe(()=> {
        this.spaceform.reset();
        this.spaceDirective.resetForm();
        this.getWorkspace();
        this.getUserSpaces();
      });
  } 

  createPage(): void {
    let pageInfo = { title: `New Page ${this.workspace.totalPages+1}`};
    this.pageService.postPage(pageInfo,this.workspace.workspaceId).subscribe(() => {
      this.getWorkspace();
      this.getPages();
    }) 
  }

  getPages(): void {
    this.pageService.getPages(this.workspace.workspaceId)
      .subscribe(pages => this.pages = pages); 
  }

  lockToggle(toggle: Event): void {
    let formData = {locked:(<HTMLInputElement>toggle.target).checked};
    let wsid = this.workspace.workspaceId, pid = this.curpage.pageId!;
    this.pageService.patchPage(formData, wsid, pid).subscribe(() => {
      this.pageService.onChangeMenu("locked");
      this.socketService.pageChanges(pid);
    })
  }

  bannerToggle(toggle: Event): void {
    let formData = {banner:(<HTMLInputElement>toggle.target).checked};
    let wsid = this.workspace.workspaceId, pid = this.curpage.pageId!;
    this.pageService.patchPage(formData, wsid, pid).subscribe(() => {
      this.pageService.onChangeMenu("banner");
      this.socketService.pageChanges(pid);
    })
  }

  shareToggle(toggle: Event): void {
    let formData = {shared:(<HTMLInputElement>toggle.target).checked};
    let wsid = this.workspace.workspaceId, pid = this.curpage.pageId!;
    this.pageService.patchPage(formData, wsid, pid).subscribe(() => {
      this.pageService.onChangeMenu("shared");
      this.shared = !this.shared;
    })
  }
  
  onDrop($event: CdkDragDrop<string[]>) {
    if($event.previousIndex!= $event.currentIndex){
      const pid = this.pages[$event.previousIndex].pageId;
      moveItemInArray(this.pages, $event.previousIndex, $event.currentIndex);

      const wsid = this.workspace.workspaceId;
      let formData = { "order": $event.currentIndex+1, "pageId": pid };
      this.pageService.patchPageOrder(formData,wsid).subscribe()
    }
    
  }
  
  deletePage(pid: string){
    const wsid = this.workspace.workspaceId;
    this.pageService.deletePage(wsid,pid).subscribe((pages) =>{
      this.pages = pages;
    })
  }

  onSpaceDrop($event: CdkDragDrop<string[]>) {
    if($event.previousIndex!=$event.currentIndex){
      const wsid = this.workspaces[$event.previousIndex].workspaceId;
      const formData = {
        title: this.workspaces[$event.previousIndex].title,
        description: this.workspaces[$event.previousIndex].description,
        order: $event.currentIndex+1,
      }

      moveItemInArray(this.workspaces, $event.previousIndex, $event.currentIndex);
      this.workspaceService.patchWorkspace(formData,wsid).subscribe(()=> {
        this.spaceform.reset();
        this.spaceDirective.resetForm();
        this.getWorkspace();
        this.getUserSpaces();
      });   
    }
  }

  deleteWorkspace(wsid: string){
    this.workspaceService.deleteWorkspace(wsid).subscribe((workspaces) =>{
      this.workspaces = workspaces;
    })
  }

  onBlur() {
    this.term$.next('');
  }

  newTerm($event: KeyboardEvent) {
    this.term$.next((<HTMLTextAreaElement>$event.target).value!)
  }
}
