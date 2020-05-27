!function(){var t={nextId:1,tasksById:{},timeslotsById:{},now:Date.now(),dropzone:!1,ui:{confirm:{ok:null,okText:"Yes",cancel:null,cancelText:"No",text:null,always:null}}},e={taskList:function(){return n.keyedObjectToArray(this.tasksById,t=>t.id)},timeslots:function(){return n.keyedObjectToArray(this.timeslotsById,t=>t.begin)},timeslotsByTask:function(){const t={};for(const e of this.timeslots)null!=e.taskId&&(null==t[e.taskId]&&(t[e.taskId]=[]),t[e.taskId].push(e));return t},tasks:function(){return this.taskList.map(this.getComputedTask)},rootTasks:function(){return this.tasks.filter(t=>null==t.parentId)},subTasks:function(){const t={};for(const e of this.taskList)null!=e.parentId&&(null==t[e.parentId]&&(t[e.parentId]=[]),t[e.parentId].push(e));return t},activeTask:function(){return this.tasks.find(t=>t.isActive)},ancestors:function(){const t={},e={};for(const n of this.taskList)t[n.id]=this.getAncestors(n,e);return t},totalDuration:function(){return this.rootTasks.reduce((t,e)=>t+this.getTaskDuration(e),0)},absoluteTotalDuration:function(){return Math.abs(this.totalDuration)}},n=function(){function t(t,e,n){let s=`${t}`;for(;s.length<n;)s=e+s;return s}function e(t,e){return t.sort((t,n)=>{const s=e(t),i=e(n);return s>i?1:i>s?-1:0})}return{secondsToDisplayDuration:function(t,{showDays:e=!0,showHours:n=!0,showMinutes:s=!0,showSeconds:i=!0}={}){const o=t<0;let a=Math.abs(t);const r=[{label:"d",sec:86400,show:e},{label:"h",sec:3600,show:n},{label:"m",sec:60,show:s},{label:"s",sec:1,show:i}].filter(t=>t.show);let u="";const l=r[r.length-1];for(const t of r){const e=Math.floor(a/t.sec);a%=t.sec,(e>0||!u&&t===l)&&(u+=e+t.label)}return(o?"-":"")+u},saveToStorage:function(t,e){window.localStorage&&window.localStorage.setItem(t,JSON.stringify(e))},getFromStorage:function(t){if(!window.localStorage)return null;try{var e=window.localStorage.getItem(t);return JSON.parse(e)}catch(t){console.error(t)}},timeToTimestamp:function(t){const e=/^([012]?[0-9]):?([0-5][0-9])$/,n=e.exec(t);if(null==n||3!==n.length)return t&&console.warn(`Invalid time string, should match RegExp ${e} but got "${t}"`),null;const s=parseInt(n[1],10),i=parseInt(n[2],10),o=new Date;return o.setHours(s),o.setMinutes(i),o.setSeconds(0,0),o.getTime()},sort:e,zeropad:function(e,n){return t(e,"0",n)},pad:t,keyedObjectToArray:function(t,n){const s=Object.keys(t).map(e=>t[e]);return"function"==typeof n?e(s,n):s},formatDuration:function(t,{showZero:e=!0,showSeconds:s=!0,showMinutes:i=!0,showHours:o=!0,showDays:a=!0}={}){const r=Math.round(t),u=n.secondsToDisplayDuration(r,{showDays:a,showSeconds:s,showMinutes:i,showHours:o});return!e&&/^-?0[dhms]$/.test(u)?null:u},formatTimestamp:function(t,e){if("number"!=typeof t)return null!=t&&console.warn(`Timestamp should be a number, but got a ${typeof t}`),e;const s=new Date(t);var i=s.getHours(),o=s.getMinutes();return n.zeropad(i,2)+":"+n.zeropad(o,2)},runIfFn:function(t,e){if("function"==typeof t){var n=[].slice.apply(arguments).slice(2);t.apply(e,n)}}}}(),s={getComputedTask:function(t){const e=this.timeslotsByTask[t.id]||[];return Object.assign({},t,{duration:this.getTaskDuration(t),timeslots:e.map(this.getComputedTimeslot),subTasks:this.getSubTasks(t).map(this.getComputedTask),isActive:e.some(t=>null!=t.begin&&null==t.end),_source:t})},getSubTasks:function(t){const e=[];for(const n of this.taskList)n.parentId===t.id&&e.push(n);return e},getComputedTimeslot:function(t){return Object.assign({},t,{isActive:null!=t.begin&&null==t.end,end:t.end||this.now,duration:this.getTimeslotDuration(t),_source:t})},getAncestors:function(t,e){const n=this.tasksById[t.parentId];if(null==n)return[];if(null!=e[t.id])return e[t.id];if(null!=n){const s=[n,...this.getAncestors(n,e)];return e[t.id]=s,s}},isAncestor:function(t,e){return this.ancestors[e.id].indexOf(t)>-1},save:function(){var e={};for(var s in t)0!==s.indexOf("_")&&0!==s.indexOf("$")&&"now"!==s&&"ui"!==s&&(e[s]=t[s]);n.saveToStorage("time-tracker",e)},inputTask:function(t){this.addTask({name:t.value}),t.value=""},addTask:function(t){const e=t.name,n=t.parentId,s=this.createTask(e,n);this.updateTask(s.id,()=>s,()=>this.startTask(s.id))},createTask:function(t,e){const n=this.nextId++,s={id:n,parentId:e,name:t};return Vue.set(this.tasksById,n,s),s},moveTask:function(t){var e=t.taskId,n=t.parentId;if(null!=e&&null!=n&&e!==n){const t=this.tasksById[e],s=this.tasksById[n];if(null==t||null==s||t.parentId===s.id)return;if(this.isAncestor(t,s))return;this.updateTask(e,t=>(Vue.set(t,"parentId",n),t))}},changeTimeslotBegin:function(t){this.changeTimeslotTimestamp(t,"begin")},changeTimeslotEnd:function(t){this.changeTimeslotTimestamp(t,"end")},changeTimeslotTimestamp:function(t,e){const n=t.timeslotId,s=t.timestamp;this.updateTimeslot(n,t=>(Vue.set(t,e,s),t))},onDrop:function(t){this.dropzone=!1;const e=t.dataTransfer.getData("taskId");e&&this.updateTask(e,t=>(Vue.delete(t,"parentId"),t))},onDragOver:function(t){t.preventDefault(),t.dataTransfer.types.indexOf("timeslotid")>-1&&(t.dataTransfer.dropEffect="none"),this.dropzone=!0},onDragLeave:function(t){t.preventDefault(),this.dropzone=!1},updateTask:function(t,e,n){e(this.tasksById[t]),"function"==typeof n&&n()},updateTimeslot:function(t,e,n){const s=this.timeslotsById[t];if(null==s)return void console.warn(`No timeslot found with id ${t}`);const i=e(s);Vue.set(this.timeslotsById,i.id,i),"function"==typeof n&&n()},startTask:function(t){const e=this.activeTask;e&&e.id!==t&&this.stopTask(e.id),this.updateTask(t,e=>(this.createTimeslot(t),e))},stopTask:function(t){this.updateTask(t,e=>{if(null==e)return;const n=(this.timeslotsByTask[t]||[]).filter(t=>null!=t.begin&&null==t.end),s=Date.now();for(const t of n)Vue.set(t,"end",s);return e})},removeTask:function(t){Vue.delete(this.tasksById,t);const e=this.subTasks[t];if(Array.isArray(e))for(const t of e)this.removeTask(t.id);const n=this.timeslotsByTask[t];if(Array.isArray(n))for(const t of n)this.removeTimeslot(t.id);0===this.tasks.length&&(this.nextId=1)},askToRemoveTask:function(t){const e=this.tasksById[t];if(null==e)return;const n=e.name||"<no name>";this.showConfirmation(`Delete ${n}?`,()=>this.removeTask(t),this.clearConfirmation)},showConfirmation:function(e,n,s,i,o,a){Vue.set(t.ui.confirm,"text",e),Vue.set(t.ui.confirm,"ok",n),Vue.set(t.ui.confirm,"always",s),Vue.set(t.ui.confirm,"cancel",i),o&&Vue.set(t.ui.confirm,"okText",o),a&&Vue.set(t.ui.confirm,"cancelText",a)},clearConfirmation:function(){t.ui.confirm.ok=null,t.ui.confirm.cancel=null,t.ui.confirm.always=null,t.ui.confirm.text=null},createTimeslot:function(t){const e=this.nextId++;this.setNow();const n={id:e,taskId:t,begin:this.now};return Vue.set(this.timeslotsById,e,n),n},removeTimeslot:function(t){Vue.delete(this.timeslotsById,t)},askToRemoveTimeslot:function(t){const e=this.timeslotsById[t];if(null==e)return;const s=this.tasksById[e.taskId],i=s&&s.name||"<no task>",o=this.getComputedTimeslot(e),a=n.formatTimestamp(o.begin,"???"),r=n.formatTimestamp(o.end,"???");this.showConfirmation(`Remove ${a} - ${r} of ${i}?`,()=>this.removeTimeslot(t),this.clearConfirmation)},timeslotToNewTask:function(t){const e=this.timeslotsById[t];if(null==e)return;const n=this.createTask(null,e.taskId);this.timeslotToTask({id:t,taskId:n.id})},timeslotToTask:function(t){const e=t.id,n=t.taskId;null!=this.tasksById[n]&&this.updateTimeslot(e,t=>(Vue.set(t,"taskId",n),t))},clearAll:function(){this.showConfirmation("Remove all tasks?",()=>{for(var t in this.nextId=1,this.tasksById)Vue.delete(this.tasksById,t);for(var e in this.timeslotsById)Vue.delete(this.timeslotsById,e)},this.clearConfirmation)},resetTask:function(t){this.updateTask(t,e=>(this.clearTimeslots(t),e))},clearTimeslots:function(t){const e=this.timeslotsByTask[t];if(Array.isArray(e))for(const t of e)Vue.delete(this.timeslotsById,t.id)},getTimeslotDuration:function(t){if(null==t||null==t.begin)return 0;const e=t.end||this.now;return Math.round((e-t.begin)/1e3)},getTaskDuration:function(t){const e=(this.timeslotsByTask[t.id]||[]).reduce((t,e)=>t+this.getTimeslotDuration(e),0),n=this.subTasks[t.id];let s=0;return Array.isArray(n)&&(s=n.reduce((t,e)=>t+this.getTaskDuration(e),0)),e+s},updateDocumentTitle:function(){if(null==this.activeTask||null==this.activeTask.duration)document.title!==this.documentTitle&&(document.title=this.documentTitle);else{const t=n.formatDuration(this.activeTask.duration,{showZero:!1,showSeconds:Math.abs(this.activeTask.duration)<60});if(null!=t){const e=this.activeTask.name||"";document.title=`${t} - ${e}`}}},formatDuration:n.formatDuration,setNow:function(){this.now=Date.now()},skipSave:function(t){this.dontSave=1,t(),Vue.nextTick(()=>delete this.dontSave)},mainLoop:function(t){this.skipSave(this.setNow),this.updateDocumentTitle(),setTimeout(()=>this.mainLoop(t),t)}};Vue.directive("focus",{inserted:function(t){t.focus()}}),Vue.component("task",{props:["task"],template:"#task",mounted:function(){const t=this.$el;t.addEventListener("dragstart",this.onDragStart),t.addEventListener("dragend",this.onDragEnd),t.addEventListener("dragover",this.onDragOver),t.addEventListener("dragleave",this.onDragLeave),t.addEventListener("drop",this.onDrop),document.addEventListener("click",this.onClick),this.task.name||(this.editName=!0)},beforeDestroy:function(){this.$el.removeEventListener("dragstart",this.onDragStart),this.$el.removeEventListener("dragend",this.onDragEnd),this.$el.removeEventListener("dragover",this.onDragOver),this.$el.removeEventListener("drop",this.onDrop),this.$el.removeEventListener("dragleave",this.onDragLeave),document.removeEventListener("click",this.onClick)},data:function(){return{dropzone:!1,dragging:!1,editName:!1,collapsed:!1}},methods:{formatTimestamp:n.formatTimestamp,formatDuration:n.formatDuration,onDragStart:function(t){t.stopPropagation(),t.dataTransfer.effectAllowed="move",t.dataTransfer.dropEffect="move",t.dataTransfer.setData("taskId",this.task.id),this.dragging=!0},onDragEnd:function(t){t.preventDefault(),this.dragging=!1},onDragOver:function(t){t.preventDefault(),t.stopPropagation(),this.dropzone=!0},onDragEnter:function(t){t.preventDefault()},onDragLeave:function(t){t.preventDefault(),this.dropzone=!1},onDrop:function(t){t.preventDefault(),t.stopPropagation(),this.dropzone=!1;const e=parseInt(t.dataTransfer.getData("taskId"),10),n=parseInt(t.dataTransfer.getData("timeslotId"),10);isNaN(e)||(isNaN(n)?this.onDropTask(e):this.onDropTimeslot(n))},onDropTask:function(t){this.$emit("move-task",{taskId:t,parentId:this.task.id})},onDropTimeslot:function(t){this.$emit("timeslot-to-task",{id:t,taskId:this.task.id})},onClick:function(t){if(null==t.target||null==t.target.parentNode)return;t.target.closest(".task")!==this.$el&&this.task.name&&(this.editName=!1)},toggleEdit:function(){this.task.name&&(this.editName=!this.editName)}}}),Vue.component("timeslot",{props:["timeslot","task"],template:"#timeslot",mounted:function(){this.$el.addEventListener("dragstart",this.onDragStart),this.$el.addEventListener("dragend",this.onDragEnd),document.addEventListener("click",this.onClick)},beforeDestroy:function(){this.$el.removeEventListener("dragstart",this.onDragStart),this.$el.removeEventListener("dragend",this.onDragEnd),document.removeEventListener("click",this.onClick)},data:function(){return{begin:null,end:null,dragging:!1}},methods:{formatTimestamp:n.formatTimestamp,formatDuration:n.formatDuration,changeTimeslotBegin:function(t){const e=this.timeslot.id,s=n.timeToTimestamp(t);this.$emit("change-timeslot-begin",{timeslotId:e,timestamp:s}),this.begin=null},changeTimeslotEnd:function(t){const e=this.timeslot.id,s=n.timeToTimestamp(t);this.$emit("change-timeslot-end",{timeslotId:e,timestamp:s}),this.end=null},onDragStart:function(t){t.stopPropagation(),t.dataTransfer.effectAllowed="move",t.dataTransfer.dropEffect="move",t.dataTransfer.setData("timeslotId",this.timeslot.id),t.dataTransfer.setData("taskId",this.timeslot.taskId),this.dragging=!0},onDragEnd:function(t){t.preventDefault(),this.dragging=!1},onClick:function(t){if(null==t.target||null==t.target.parentNode)return;t.target.closest(".timeslot")!==this.$el&&(this.begin=null,this.end=null)}}}),Vue.component("confirm-dialog",{template:"#confirm-dialog",props:["config"],methods:{ok:function(){n.runIfFn(this.config.ok),n.runIfFn(this.config.always)},cancel:function(){n.runIfFn(this.config.cancel),n.runIfFn(this.config.always)},onClick:function(t){t.preventDefault(),t.stopPropagation(),t.target===this.$el&&this.cancel()},onKeyup:function(t){27===t.keyCode&&this.cancel()}},mounted:function(){this.$el.addEventListener("click",this.onClick),document.addEventListener("keyup",this.onKeyup)},beforeDestroy:function(){this.$el.removeEventListener("click",this.onClick),document.removeEventListener("keyup",this.onKeyup)}});new Vue({el:"#time-tracker",data:t,methods:s,computed:e,beforeCreate:function(){var e=n.getFromStorage("time-tracker");null!=e&&Object.assign(t,e)},mounted:function(){this.documentTitle=document.title,Vue.nextTick(()=>this.mainLoop(1e3)),this.$el.addEventListener("drop",this.onDrop),this.$el.addEventListener("dragover",this.onDragOver),this.$el.addEventListener("dragleave",this.onDragLeave)},beforeDestroy:function(){this.$el.removeEventListener("drop",this.onDrop),this.$el.removeEventListener("dragover",this.onDragOver),this.$el.removeEventListener("dragleave",this.onDragLeave)},updated:function(){this.dontSave||this.save()}})}();