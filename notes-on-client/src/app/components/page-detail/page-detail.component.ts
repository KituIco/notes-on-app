import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { Page } from 'src/app/interfaces/page';
import { Block, Sizes } from 'src/app/interfaces/block';
import { PageService } from 'src/app/services/page.service';
import { BlockService } from 'src/app/services/block.service';
import { SocketService } from 'src/app/services/socket.service';
import { ToastrService } from 'ngx-toastr';

import { FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { ContentChange, SelectionChange } from 'ngx-quill'
import { interval, Observable, Subscription } from 'rxjs';

import Quill from 'quill';

const Link = Quill.import('formats/link');

class ClickableLink extends Link {
  public static create(value: string): ClickableLink {
    const node = super.create(value);
    node.setAttribute('href', Link.sanitize(value));
    node.setAttribute('target', '_blank');
    node.setAttribute('contenteditable', 'false');
    return node;
  }
}

Quill.register('formats/link', ClickableLink, true);

@Component({
  selector: 'app-page-detail',
  templateUrl: './page-detail.component.html',
  styleUrls: ['./page-detail.component.css']
})
export class PageDetailComponent implements OnInit {
  private sub!: Subscription|null;
  changed = false;
  newTitle = false;
  onhold = true;
  forceLock = false;

  page!: Page;
  blocks: Block[] = [];
  block!: Partial<Block>;
  image!: string;

  sizes: Sizes = {
    "full" : 12,
    "large": 8, 
    "half" : 6,
    "small": 4
  }

  form: FormGroup = this.formBuilder.group({
    cover: new FormControl(''),
    icon: new FormControl(''),
    title: new FormControl(''),
    temp: new FormControl(''),
  })

  formats = [
    'background',
    'bold',
    'color',
    'font',
    'code',
    'italic',
    'link',
    'size',
    'strike',
    'script',
    'underline',
    'blockquote',
    'header',
    'indent',
    'align',
  ]
  
  modules = {
    keyboard: {
      bindings: {

        customEnter: {
          key: "enter",
          shiftKey: false,
          handler: () => {
            if(this.block.order!>0){
              this.saveSelection(this.block);
            } else {
              this.titleEntered();
            }
            this.createBlock(this.block.order!+1);    
          }
        },

        customBack:{
          key: "backspace",
          empty: true,
          handler: () => {
            if(this.block.order!>0 && !this.form.get(this.block.blockId!)!.value){
              return this.deleteBlock(this.block.blockId!);
            } else {
              return true;
            }
          }
        }

      }
    }
  }

  constructor(
    private route: ActivatedRoute,
    private pageService: PageService,
    private blockService: BlockService,
    private socketService: SocketService,
    private sanitizer: DomSanitizer, 
    private formBuilder: FormBuilder,
    private cdref: ChangeDetectorRef,
    private toastr: ToastrService,
  ) { 
    this.pageService.changePageMenu$.subscribe((type) => {
      const pid = this.route.snapshot.paramMap.get('pageId');
      this.route.parent?.params.subscribe((params) =>{
          this.pageService.getPage(params['workspaceId'], pid!)
            .subscribe(page => {
              this.page = page;
              this.form.get('title')!.patchValue(this.page.title);
              this.cdref.detectChanges();
            })
        })
    })
  }

  ngOnInit(): void {
    this.route.params.subscribe(()=> {
      const pid = this.route.snapshot.paramMap.get('pageId');
      this.socketService.joinPage(pid!);
      this.getPage(true, true);
    })

    this.socketService.onChanged.subscribe(() => {
      if(!this.forceLock){
        this.toastr.warning('Changes Detected. Click Here to See Changes.', '', {disableTimeOut: true, positionClass: 'toast-top-right' })
        .onTap.pipe().subscribe(() => {
          this.getPage(true,false)
          this.forceLock = false;
        });
        this.forceLock = true;
      }
    });
  }

  getPage(getBlocks: boolean, changed: boolean, focus?: string): void {
    const pid = this.route.snapshot.paramMap.get('pageId');
    this.route.parent?.params.subscribe((params) =>{
      if(pid) {
        this.pageService.getPage(params['workspaceId'], pid)
          .subscribe(page => {
            this.page = page;
            this.form.get('title')!.patchValue(this.page.title);

            if (changed) this.pageService.onChange(this.page);
            if (getBlocks) this.getBlocks(focus);
            this.cdref.detectChanges();
          })
      }
    })
  }

  byPassHTML(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html)
  }

  titleSelection($event: SelectionChange|null): void {
    if(!null && !$event?.oldRange) this.block = { order: 0 };
    if($event?.oldRange && !$event.range && this.newTitle)
      this.titleEntered();
  }

  titleChange($event: ContentChange): void {
    this.newTitle = true;
    if(!this.sub){
      this.sub = interval(3000).subscribe(() =>{
        this.titleEntered();
      })
    }
  }

  titleEntered(): void {
    this.sub!.unsubscribe(); this.sub = null;
    this.newTitle = false;
    if(this.form.get('title')!.value){
      const formData = {"title": this.form.get('title')!.value!.split(/>|</)[2]};
      const pid = this.route.snapshot.paramMap.get('pageId')
      const wsid = this.page.workspaceId
      if(wsid && pid) 
        this.pageService.patchPage(formData,wsid,pid).subscribe(() => {
          if(formData.title) {
            this.page.title = formData.title;
            this.pageService.onChange(this.page);
            this.socketService.pageChanges(pid);
          }
        });
    } 
  }

  createBlock(orderPos: number): void {
    const blockInfo = { type: 'body', order: orderPos};
    this.blockService.postBlock(blockInfo,this.page.workspaceId,this.page.pageId).subscribe((block) => {
      this.blocks.splice(block.order-1,0,block);
      this.form = this.formBuilder.group({
        ...this.form.controls,
        [block.blockId] : new FormControl(''),
      });
      this.getPage(true, false, block.blockId);
      this.socketService.pageChanges(this.page.pageId);
    }) 
  }

  getBlocks(focus?: string): void {
    this.blockService.getBlocks(this.page.workspaceId,this.page.pageId)
      .subscribe(blocks => { 
        this.blocks = blocks;
        for(let i=0; i<this.blocks.length; i++) {
          let block = this.blocks[i];
          this.form = this.formBuilder.group({
            ...this.form.controls,
            [block.blockId] : new FormControl(block.content),
          });
        }
        this.cdref.detectChanges();
        if (focus) {
          this.form.get(focus)!.patchValue('<div><em style="color: rgb(187, 187, 187);">New Block...</em></div>');
          this.fadeOut(document.getElementById(focus)!, 1)

          setTimeout(() =>{
            this.form.get(focus)!.patchValue('');
            this.cdref.detectChanges();
          }, 1100);
        }
      }); 
  }

  fadeOut(block: HTMLElement, opacity: number):void {
    block.style.opacity = `${opacity}`;
    if(opacity > 0) setTimeout(()=> this.fadeOut(block,opacity-0.1), 100);
    else block.style.opacity = "1";
  }
  
  blockSelection(block: Block, $event: SelectionChange): void {
    if(!$event.oldRange) this.block = block;    
    if($event.oldRange){
      if(this.changed) {
        this.updateBlock(block.blockId);
      }
    }
  }

  blockChange(id: string, $event: ContentChange): void {
    this.changed = true;
    if(!this.sub){
      this.socketService.pageChanges(this.page.pageId);
      this.sub = interval(3000).subscribe(() =>{
        this.updateBlock(id);
      })
    }
  }

  updateBlock(id:string): void {
    if(this.sub) {
      this.sub!.unsubscribe(); 
      this.sub = null;
      let formData = {"content": this.form.get(id)!.value};
      if(!this.form.get(id)!.value) {
        formData = {"content": ""};
      }

      const pid = this.route.snapshot.paramMap.get('pageId')!;
      const wsid = this.page.workspaceId;
      this.blockService.patchBlock(formData,wsid,pid,id).subscribe();
      this.changed = false;
    }
  }

  saveSelection(block: Partial<Block>): void {
    let formData = { "content": this.form.get(block.blockId!)!.value };
    if(!this.form.get(block.blockId!)!.value) formData = {"content": ""};

    if(this.changed) {
      const pid = this.route.snapshot.paramMap.get('pageId')!;
      const wsid = this.page.workspaceId;
      this.blockService.patchBlock(formData,wsid,pid,block.blockId!).subscribe();
      this.socketService.pageChanges(this.page.pageId);
    }
    this.changed = false;
  }

  deleteBlock(id: string): void {
    const pid = this.route.snapshot.paramMap.get('pageId')!;
    const wsid = this.page.workspaceId;
    this.blockService.deleteBlock(wsid,pid,id).subscribe((blocks) =>{
      this.getPage(false, false); 
      this.blocks = blocks;
      this.onhold = true;
      this.socketService.pageChanges(this.page.pageId);
      this.cdref.detectChanges();

      setTimeout(()=>{
        this.cdref.detectChanges();
      }, 2000)
    })
  }

  editType(id: string, pos: number, newtype: string): void {
    const pid = this.route.snapshot.paramMap.get('pageId')!;
    const wsid = this.page.workspaceId;

    let formData;
    if(newtype=='image') formData = {type: newtype, content: ''};
    else formData = {type: newtype};

    this.blockService.patchBlock(formData,wsid,pid,id).subscribe(()=> {
      this.blocks[pos-1].type = newtype;
      this.socketService.pageChanges(this.page.pageId);
      this.cdref.detectChanges()
    })
  }

  editSize(id: string, pos: number, newsize: string): void {
    const pid = this.route.snapshot.paramMap.get('pageId')!;
    const wsid = this.page.workspaceId;
    const formData = {size: newsize};

    this.blockService.patchBlock(formData,wsid,pid,id).subscribe(()=> {
      this.blocks[pos-1].size = newsize;
      this.socketService.pageChanges(this.page.pageId);
      this.cdref.detectChanges()
    })
  }


  onFileSelect($event: Event, id: string): void {
    const file = ($event.target as HTMLInputElement).files![0];
    this.form.get(id)!.patchValue( file );

    const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"]
    if (file && allowedMimeTypes.includes(file.type)) {
      let formData = { "content": this.form.get(id)!.value };
      const pid = this.route.snapshot.paramMap.get('pageId')!;
      const wsid = this.page.workspaceId;
      this.blockService.patchBlockImg(formData,wsid,pid,id).subscribe(() => {
        this.getBlocks();
        this.socketService.pageChanges(this.page.pageId);
        this.cdref.detectChanges();
      });
    }
  }

  onDrop($event: CdkDragDrop<string[]>): void {
    if($event.previousIndex != $event.currentIndex){
      const pid = this.route.snapshot.paramMap.get('pageId')!;
      const wsid = this.page.workspaceId;
      const id = this.blocks[$event.previousIndex].blockId;
      moveItemInArray(this.blocks, $event.previousIndex, $event.currentIndex);
      this.socketService.pageChanges(this.page.pageId);

      let formData = { "order": $event.currentIndex+1, "blockId": id };
      this.blockService.patchBlockOrder(formData,wsid,pid).subscribe((blocks) => {
        this.blocks = blocks;
      });
    }
  }

  onCoverSelect($event: Event): void {
    const file = ($event.target as HTMLInputElement).files![0];
    this.form.get('cover')!.patchValue( file );

    const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"]
    if (file && allowedMimeTypes.includes(file.type)) {
      let formData = { "cover": this.form.get('cover')!.value };
      const pid = this.route.snapshot.paramMap.get('pageId')!;
      const wsid = this.page.workspaceId;
      this.pageService.patchPageCover(formData,wsid,pid).subscribe(() => {
        this.getPage(false, false); 
        this.cdref.detectChanges();
        this.socketService.pageChanges(pid);
      });
    }
  }

  onIconSelect($event: Event): void {
    const file = ($event.target as HTMLInputElement).files![0];
    this.form.get('icon')!.patchValue( file );
    
    const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"]
    if (file && allowedMimeTypes.includes(file.type)) {
      let formData = { "icon": this.form.get('icon')!.value };
      const pid = this.route.snapshot.paramMap.get('pageId')!;
      const wsid = this.page.workspaceId;
      this.pageService.patchPageIcon(formData,wsid,pid).subscribe(() => {
        this.getPage(false, false);
        this.socketService.pageChanges(pid);
        this.cdref.detectChanges();
      });
    }
  }

  onDrag(): void {
    this.onhold = false;
    this.cdref.detectChanges();
  }

  outDrag(): void {
    this.onhold = true;
    this.cdref.detectChanges();
  }

}


