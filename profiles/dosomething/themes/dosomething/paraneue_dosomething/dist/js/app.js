define("text",{load:function(e){throw new Error("Dynamic load not allowed: "+e)}}),define("text!finder/templates/campaign.tpl.html",[],function(){return'<li>\n<article class="tile tile--campaign campaign-result<% if(featured) { %> big<% } %>">\n  <a class="wrapper" href="<%= url %>">\n    <% if(staffPick) {  %><div class="__flag -staff-pick"><%= Drupal.t("Staff Pick") %></div><% } %>\n    <div class="tile--meta">\n      <h1 class="__title"><%= title %></h1>\n      <p class="__tagline"><%= description %></p>\n    </div>\n    <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=" data-src="<%= image %>">\n  </a>\n</article>\n</li>\n'}),define("finder/Campaign",["require","jquery","lodash","text!finder/templates/campaign.tpl.html"],function(e){var t=e("jquery"),n=e("lodash"),a=e("text!finder/templates/campaign.tpl.html"),i=function(e){var n={title:Drupal.t("New Campaign"),description:Drupal.t("Take your dad to get his blood pressure checked"),url:"#",staffPick:!1,featured:!1};t.extend(this,n,this.convert(e))};return i.prototype.convert=function(e){var t={},n={label:"title",sm_field_call_to_action:"description",url:"url",bs_field_staff_pick:"staffPick",bs_sticky:"featured",ss_field_search_image_400x400:"image"};for(var a in e)void 0!==n[a]&&(t[n[a]]=e[a]);return t},i.prototype.render=function(){var e=n.template(a,{image:this.image,staffPick:this.staffPick,featured:this.featured,title:this.title,description:this.description,url:this.url});return e},i}),define("text!finder/templates/no-results.tpl.html",[],function(){return'<div class="no-result">\n  <div class="wrapper">\n    <p class="message"><%= Drupal.t("Oh snap! We\'ll work on that.") %></p>\n    <p>\n      <a id="reset-filters" href="/">\n        <%= Drupal.t("Want to try another combo?") %>\n      </a>\n    </p>\n  </div>\n</div>\n'}),define("finder/ResultsView",["require","jquery","lodash","finder/Campaign","text!finder/templates/no-results.tpl.html"],function(e){var t=e("jquery"),n=e("lodash"),a=e("finder/Campaign"),i=e("text!finder/templates/no-results.tpl.html"),s={$container:null,$gallery:t("<ul class='gallery -mosaic'></ul>"),$blankSlateDiv:null,slots:0,maxSlots:8,start:0,init:function(e,n,a,i){s.$container=e,s.$container.hide(),s.$paginationLink=t("<div class='pagination-link'><a href='#' class='secondary js-finder-show-more'>"+Drupal.t("Show More")+"</a></div>"),t("body").on("click",".js-finder-show-more",function(e){e.preventDefault(),a(s.start)}),s.$blankSlateDiv=n,s.$container.on("click","#reset-filters",function(e){e.preventDefault(),s.showBlankSlate(),i()})},showBlankSlate:function(){s.$container.hide(),s.$blankSlateDiv.show()},showEmptyState:function(){var e=n.template(i);s.$container.append(e)},parseResults:function(e){if(s.clear(),e.retrieved>0){s.$container.append(s.$gallery);for(var t in e.result.response.docs)s.add(new a(e.result.response.docs[t]));s.showPaginationLink(e.result.response.numFound>s.start)}else s.showEmptyState();s.loading(!1)},showPaginationLink:function(e){s.$paginationLink.remove(),e&&(s.$container.append(s.$paginationLink),s.$paginationLink.show())},appendResults:function(e){for(var t in e.result.response.docs)s.add(new a(e.result.response.docs[t]));s.showPaginationLink(e.result.response.numFound>s.start),s.loading(!1)},loading:function(e){void 0===e&&(e=!0),s.$container.append("<div class='spinner'></div>"),s.$container.toggleClass("loading",e)},checkInit:function(){if(null===s.$container)throw Drupal.t("Error: ResultsView is not initialized.")},clear:function(){s.checkInit(),s.$container.empty(),s.$gallery.empty(),s.$container.show(),s.$blankSlateDiv.hide(),s.slots=0,s.start=0},add:function(e){s.checkInit(),s.$gallery.append(e.render()),s.slots++,s.start++,s.$container.find("img").unveil(200,function(){t(this).load(function(){this.style.opacity=1})})}};return s}),define("finder/SolrAdapter",["require","jquery","lodash"],function(e){var t=e("jquery"),n=e("lodash");window.solrResponse=function(){};var a={throttleTimeout:400,baseURL:Drupal.settings.dosomethingSearch.solrURL,collection:Drupal.settings.dosomethingSearch.collection,throttle:null,defaultQuery:["fq=-sm_field_campaign_status:(closed) bundle:[campaign TO campaign_group]","wt=json","indent=false","facet=true","facet.field=fs_field_active_hours","facet.field=im_field_cause","facet.field=im_field_action_type","rows=8","fl=label,tid,im_vid_1,sm_vid_Action_Type,tm_vid_1_names,im_field_cause,im_vid_2,sm_vid_Cause,tm_vid_2_names,im_field_tags,im_vid_5,sm_vid_Tags,tm_vid_5_names,fs_field_active_hours,sm_field_call_to_action,bs_field_staff_pick,ss_field_search_image_400x400,ss_field_search_image_720x720,url"],fieldMap:{cause:"im_field_cause",time:"fs_field_active_hours","action-type":"im_field_action_type"},fieldMapInverse:{},responseData:null,init:function(){a.fieldMapInverse=n.invert(a.fieldMap)},throttledQuery:function(e,t,n){clearTimeout(a.throttle),a.throttle=setTimeout(function(){a.query(e,t,n)},a.throttleTimeout)},query:function(e,i,s){var r=n.clone(a.defaultQuery);r.push("start="+i);var o=[];n.forOwn(e,function(e,t){if(!n.isEmpty(e)){var i="("+e.join(") OR (")+")",s=a.generatePowerset(e);s.length&&(i+=" OR "+s),o.push(a.fieldMap[t]+":("+encodeURIComponent(i)+")")}}),a.xhr&&a.xhr.abort(),a.xhr=t.ajax({dataType:"jsonp",cache:!0,jsonpCallback:"solrResponse",url:a.buildQuery(r,o),success:function(e){s({result:e,retrieved:e.response.docs.length})},error:function(e,t){s({result:!1,error:t})},jsonp:"json.wrf"})},buildQuery:function(e,t){var n=e.push("q=")-1,i='_query_:"{!func}scale(is_bubble_factor,0,100)" AND ';return e[n]=t.length>0?1===t.length?"q="+i+t[0]:"q="+i+"("+t.join(") AND (")+")":i,e=e.join("&"),a.baseURL+a.collection+"/select?"+e},generatePowerset:function(e){function t(e){for(var t=[[]],n=0;n<e.length;n++)for(var a=0,i=t.length;i>a;a++)t.push(t[a].concat(e[n]));return t}for(var n=t(e),a=[],i=1;i<n.length;i++)n[i].length>1&&a.push("(("+n[i].join(") AND (")+"))^"+100*n[i].length);return a.join(" OR ")}};return a}),define("text!finder/templates/error.tpl.html",[],function(){return'<div class="messages error">\n  <%= Drupal.t("Ooof! We\'re not sure what\'s up? Maybe it\'s us, or it could be your internet connection. Want to try again in a few minutes?") %>\n</div>\n'}),define("finder/FormView",["require","jquery","lodash","finder/ResultsView","finder/SolrAdapter","text!finder/templates/error.tpl.html"],function(e){var t=e("jquery"),n=e("lodash"),a=e("finder/ResultsView"),i=e("finder/SolrAdapter"),s=e("text!finder/templates/error.tpl.html"),r={$div:null,$searchButton:null,$fields:{},lastChanged:null,cssBreakpoint:768,init:function(e,s){r.$div=e,e.find("[data-toggle]").click(function(){var e=t(this),n=e.data("toggle"),a=e.parent("."+n),i=a.siblings();a.toggleClass("open"),t(window).outerWidth()>=r.cssBreakpoint&&(a.hasClass("open")?i.addClass("open"):i.removeClass("open"))}),r.$fields.cause=e.find("input[name='cause']"),r.$fields.time=e.find("input[name='time']"),r.$fields["action-type"]=e.find("input[name='action-type']"),r.$searchButton=e.find(".campaign-search"),n.each(r.$fields,function(e){e.each(function(e,n){var a=i.fieldMap[t(n).prop("name")],s=t(n).val();i.defaultQuery.push("facet.query="+a+":"+s)})}),n.each(r.$fields,function(e){e.change(function(){t(this).parents("li").toggleClass("checked",t(this).is(":checked")),r.lastChanged=t(this).attr("name"),s()})}),r.$searchButton.click(function(){s(),t("html,body").animate({scrollTop:a.$div.offset().scrollTop},1e3)})},checkInit:function(){if(null===r.$div)throw Drupal.t("Error: FormView is not initialized.")},showErrorMessage:function(){var e=n.template(s);t(".error").length<1&&r.$div.parents(".finder--form").after(e)},hasCheckedFields:function(){var e=!1;return n.each(r.$fields,function(t){t.filter(":checked").length>0&&(e=!0)}),e},getCheckedFields:function(){var e=[];return n.each(r.$fields,function(n,a){var i=n.filter(":checked");e[a]=[],i.length>0&&i.each(function(n,i){e[a].push(t(i).val())})}),e},disableFields:function(e){r.checkInit(),n.each(e,function(a,s){var r=s.split(":"),o=r[0],l=r[1],c=t("input[name='"+i.fieldMapInverse[o]+"']");if(n.isEmpty(c.filter(":checked"))){var u=0===e[s],d=c.filter("[value='"+l+"']");d.prop("disabled",u),u?(d.prop("checked",!u),d.parents("li").addClass("disabled")):d.parents("li").removeClass("disabled")}else c.filter(":not(:checked)").prop("disabled",!0),c.filter(":not(:checked)").parents("li").addClass("disabled")})},clear:function(){n.each(r.$fields,function(e){var t=e.filter(":disabled");t&&e.prop("disabled",!1).parents("li").removeClass("disabled")})}};return r}),define("finder/Finder",["require","finder/FormView","finder/ResultsView","finder/SolrAdapter"],function(e){var t=e("finder/FormView"),n=e("finder/ResultsView"),a=e("finder/SolrAdapter"),i={init:function(e,s,r){t.init(e,i.query),n.init(s,r,i.query,t.clear),a.init()},query:function(e){var s=e||0,r=t.getCheckedFields();s?a.throttledQuery(r,s,n.appendResults):a.throttledQuery(r,s,i.displayResults),n.loading()},displayResults:function(e){e.result?t.hasCheckedFields()?(n.parseResults(e),t.disableFields(e.result.facet_counts.facet_queries)):(n.showBlankSlate(),t.clear()):t.showErrorMessage()}};return i}),define("neue/carousel",[],function(){var e=window.jQuery;e(function(){function t(){0===i?i=s:i--}function n(){i===s?i=0:i++}function a(a){e("#slide"+i).removeClass("visible"),"prev"===a?t():n(),e("#slide"+i).addClass("visible")}e("#slide0").addClass("visible");var i=0,s=e(".slide").length-1,r=e("#prev, #next");r.click(function(){a(e(this).attr("id"))})})}),define("neue/events",[],function(){var e={},t=-1,n=function(t,n){return e[t]?(setTimeout(function(){for(var a=e[t],i=a?a.length:0;i--;)a[i].func(t,n)},0),!0):!1},a=function(n,a){e[n]||(e[n]=[]);var i=(++t).toString();return e[n].push({token:i,func:a}),i},i=function(t){for(var n in e)if(e[n])for(var a=0,i=e[n].length;i>a;a++)if(e[n][a].token===t)return e[n].splice(a,1),t;return!1};return{publish:n,subscribe:a,unsubscribe:i}}),define("neue/jump-scroll",[],function(){var e=window.jQuery;e(function(){e(".js-jump-scroll").on("click",function(t){t.preventDefault();var n=e(this).attr("href");e("html,body").animate({scrollTop:e(t.target.hash).offset().top},"slow",function(){window.location.hash=n})})})}),define("neue/menu",[],function(){var e=window.jQuery;e(function(){e(".js-toggle-mobile-menu").on("click",function(){e(".chrome--nav").toggleClass("is-visible")}),e(".js-footer-col").addClass("is-collapsed"),e(".js-footer-col h4").on("click",function(){window.matchMedia("screen and (max-width: 768px)").matches&&e(this).closest(".js-footer-col").toggleClass("is-collapsed")})})}),define("neue/messages",[],function(){var e=window.jQuery,t='<a href="#" class="js-close-message message-close-button white">×</a>',n=function(n,a){n.append(t),n.on("click",".js-close-message",function(t){t.preventDefault(),e(this).parent(".messages").slideUp(),a&&"function"==typeof a&&a()})};return e(function(){n(e(".messages"))}),{attachCloseButton:n}}),define("neue/modal",["require","./events"],function(e){var t=window.jQuery,n=window.Modernizr,a=e("./events"),i=t(document),s=t(".chrome"),r=null,o=t("<a href='#' class='js-close-modal js-modal-generated modal-close-button -alt'>skip</a>"),l=t("<a href='#' class='js-close-modal js-modal-generated modal-close-button'>&#215;</a>"),c=null,u=!1,d=function(){return null!==c},f=function(e,n,a){switch(n){case"skip":e.prepend(o),o.on("click",function(e){e.preventDefault(),t(a).submit()}),u=!1;break;case"false":case"0":u=!1;break;default:e.prepend(l),u=!0}},p=function(e,t){t=t||{},t.animated="boolean"==typeof t.animated?t.animated:!0,t.closeButton="undefined"!=typeof t.closeButton?t.closeButton:e.attr("data-modal-close"),t.skipForm="undefined"!=typeof t.skipForm?t.skipForm:e.attr("data-modal-skip-form");var o="-"+i.scrollTop()+"px";f(e,t.closeButton,t.skipForm),d()?(c.hide(),e.show()):(s.css("top",o),s.addClass("modal-open"),r.css("display","block"),t.animated&&n.cssanimations&&r.addClass("animated-open"),e.css("display","block")),setTimeout(function(){i.scrollTop(0)},50),a.publish("Modal:Open",e),c=e},m=function(e){r.css("display","none"),r.removeClass("animated-close"),c.css("display","none"),c.find(".js-modal-generated").remove(),s.removeClass("modal-open"),s.css("top",""),i.scrollTop(e),c=null},h=function(e){e=e||{},e.animated="undefined"!=typeof e.animated?e.animated:!0;var t=-1*parseInt(s.css("top"));e.animated&&n.cssanimations?(r.addClass("animated-close"),r.one("webkitAnimationEnd oanimationend msAnimationEnd animationend",function(){m(t)})):m(t),window.location.hash==="#"+c.attr("id")&&(window.location.hash="/"),a.publish("Modal:Close",c)},g=function(e){e.preventDefault();var n=t(this).data("modal-href");p(t(n))},v=function(e){e.target===this&&(t(this).hasClass("js-close-modal")||u)&&(e.preventDefault(),h())};return i.ready(function(){var e=t("body");r=t("<div class='modal-container'></div>"),e.append(r),t("[data-modal]").each(function(){t(this).appendTo(r),t(this).attr("hidden",!0)});var n=window.location.hash;n&&"#/"!==n&&t(n)&&"undefined"!=typeof t(n).data("modal")&&p(t(n)),e.on("click","[data-modal-href]",g),e.on("click",".modal-container",v),e.on("click",".js-close-modal",v)}),{isOpen:d,open:p,close:h}}),define("neue/scroll-indicator",[],function(){function e(){i=[],a(".js-scroll-indicator").each(function(e,n){t(a(n))})}function t(e){var t=a(e.attr("href"));if(t.length){var s=t.offset().top,r={$el:e,targetOffset:s};i.push(r)}n()}function n(){a.each(i,function(e,t){var n=a(window).scrollTop()+t.$el.height();return n>t.targetOffset?(a(".js-scroll-indicator").removeClass("is-active"),void t.$el.addClass("is-active")):void 0})}var a=window.jQuery,i=[];a(function(){e(),a(window).on("scroll",n),a(window).on("resize",e)})}),define("neue/sticky",[],function(){function e(){i=[],a(".js-sticky").each(function(e,n){t(n)})}function t(e){var t=a(e).offset().top,s={$el:a(e),offset:t};i.push(s),n()}function n(){a.each(i,function(e,t){a(window).scrollTop()>t.offset?t.$el.addClass("is-stuck"):t.$el.removeClass("is-stuck")})}var a=window.jQuery,i=[];a(function(){e(),a(window).on("scroll",n),a(window).on("resize",e)})}),define("neue/validation",["require","./events"],function(e){var t=window.jQuery,n=e("./events"),a=[],i=function(e){e.each(function(){var e=t(this);s(t("label[for='"+e.attr("id")+"']")),e.on("blur",function(t){t.preventDefault(),r(e)})})},s=function(e){if(0===e.find(".inner-label").length){var n=t("<div class='inner-label'></div>");n.append("<div class='label'>"+e.html()+"</div>"),n.append("<div class='message'></div>"),e.html(n)}},r=function(e,n,i){n="undefined"!=typeof n?n:!1,i="undefined"!=typeof i?i:function(e,t){c(e,t)};var s=e.data("validate"),o=e.data("validate-trigger");if(o&&r(t(o)),a[s])if(f(e)){var l=e.val();if(n||""!==l)if("match"===s){var u=t(e.data("validate-match")).val();a[s].fn(l,u,function(t){i(e,t)})}else a[s].fn(l,function(t){i(e,t)})}else if("match"===s){var d=t(e.data("validate-match"));a[s].fn(e,d,function(t){i(e,t)})}else a[s].fn(e,function(t){i(e,t)})},o=function(e,t){if(a[e])throw"A validation function with that name has already been registered";a[e]=t},l=function(e,t){var n={fn:t};o(e,n)},c=function(e,a){var i=t("label[for='"+e.attr("id")+"']"),s=i.find(".message");return e.removeClass("success error warning shake"),s.removeClass("success error warning"),a.success===!0?(e.addClass("success"),s.addClass("success")):(e.addClass("error"),s.addClass("error"),f(e)&&e.addClass("shake"),n.publish("Validation:InlineError",i.attr("for"))),a.message&&s.text(a.message),a.suggestion&&(s.html("Did you mean "+a.suggestion.full+"? <a href='#' data-suggestion='"+a.suggestion.full+"'class='js-mailcheck-fix'>Fix it!</a>"),n.publish("Validation:Suggestion",a.suggestion.domain)),i.addClass("show-message"),t(".js-mailcheck-fix").on("click",function(e){e.preventDefault();var a=t("#"+t(this).closest("label").attr("for"));a.val(t(this).data("suggestion")),a.trigger("blur"),n.publish("Validation:SuggestionUsed",t(this).text())}),e.on("focus",function(){e.removeClass("warning error success shake"),i.removeClass("show-message")}),a.success},u=function(e){var t=e.find(":submit");t.attr("disabled",!0),"BUTTON"===t.prop("tagName")&&t.addClass("loading")},d=function(e){var t=e.find(":submit");t.attr("disabled",!1),t.removeClass("loading disabled")},f=function(e){var t=e.prop("tagName");return"INPUT"===t||"SELECT"===t||"TEXTAREA"===t};return t("body").on("submit","form",function(e,a){var i=t(this),s=i.find("[data-validate]").filter("[data-validate-required]");if(u(i),0===s.length)return!0;if(a===!0)return!0;e.preventDefault();var o=0,l=0;return s.each(function(){r(t(this),!0,function(e,a){o++,c(e,a),a.success&&l++,o===s.length&&(l===s.length?(n.publish("Validation:Submitted",t(this).attr("id")),i.trigger("submit",!0)):(n.publish("Validation:SubmitError",t(this).attr("id")),d(i)))})}),!1}),l("match",function(e,t,n){return n(e===t&&""!==e?{success:!0,message:"Looks good!"}:{success:!1,message:"That doesn't match."})}),t(function(){i(t("body").find("[data-validate]"))}),{prepareFields:i,registerValidation:o,registerValidationFunction:l,validateField:r,showValidationMessage:c,Validations:a}}),define("neue/main",["require","./carousel","./events","./jump-scroll","./menu","./messages","./modal","./scroll-indicator","./sticky","./validation"],function(e){return window.NEUE={Carousel:e("./carousel"),Events:e("./events"),JumpScroll:e("./jump-scroll"),Menu:e("./menu"),Messages:e("./messages"),Modal:e("./modal"),ScrollIndicator:e("./scroll-indicator"),Sticky:e("./sticky"),Validation:e("./validation")},window.NEUE}),define("campaign/sources",["require","jquery","neue/events"],function(e){var t=e("jquery"),n=e("neue/events"),a=function(e){var n=e.find("ul, div:first");n.hide(),t(".js-toggle-sources").on("click",function(){n.slideToggle()})},i=t(".sources")||null;n.subscribe("Modal:opened",function(){var e=t(".modal .sources")||null;a(e)}),i&&a(i)}),define("campaign/tips",["require","jquery"],function(e){var t=e("jquery");t(".js-show-tip").on("click",function(e){e.preventDefault();var n=t(this),a=n.closest(".tips--wrapper");a.find(".tip-header").removeClass("active"),n.addClass("active");var i=n.attr("href").slice(1);a.find(".tip-body").hide(),a.find("."+i).show()})}),define("campaign/tabs",["require","jquery"],function(e){var t=e("jquery"),n=t(".js-tabs"),a=n.find(".tabs__menu a");n.each(function(){t(this).find(".tab").first().addClass("is-active")}),a.on("click",function(e){e.preventDefault();var n=t(this),a=n.parent().siblings(),i=n.data("tab")-1,s=n.closest(".js-tabs").find(".tab"),r=s.get(i);a.removeClass("is-active"),n.parent().addClass("is-active"),s.removeClass("is-active"),t(r).addClass("is-active")})}),define("campaign/ImageUploader",["require","jquery"],function(e){var t=e("jquery"),n=function(e){var n=e.find(".js-image-upload");n.each(function(e,n){t(n).wrap(t("<div class='image-upload-container'></div>"));var a=t(n).parent(".imageUploadContainer");a.wrap("<div style='clear: both'></div>");var i=t("<a href='#' class='btn secondary small'>"+Drupal.t("Upload A Pic")+"</a>");i.insertAfter(t(n));var s=t("<img class='preview' src=''>");s.insertBefore(a),s.hide();var r=t("<p class='filename'></p>");r.insertAfter(i),t(n).on("change",function(e){e.preventDefault(),s.hide(),i.text(Drupal.t("Change Pic"));var a=this.files?this.files:[];if(a[0]&&a[0].name)r.text(a[0].name);else{var o=t(n).val().replace("C:\\fakepath\\","");r.text(o)}if(a.length&&window.FileReader&&/^image/.test(a[0].type)){var l=new FileReader;l.readAsDataURL(a[0]),l.onloadend=function(){s.show(),s.attr("src",this.result)}}})})};t(function(){n(t("body"))})}),define("validation/auth",["require","neue/validation","mailcheck"],function(e){function t(e){var t=e.toUpperCase();if(t.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]+$/)){for(var n="",a=0,i=t.length;i>a;a++){if("."===n&&"."===t[a])return!1;n=t[a]}return!0}return!1}var n=e("neue/validation"),a=e("mailcheck");n.registerValidationFunction("name",function(e,t){return t(""!==e?{success:!0,message:Drupal.t("Hey, @name!",{"@name":e})}:{success:!1,message:Drupal.t("We need your first name.")})}),n.registerValidationFunction("birthday",function(e,t){var n,a,i,s;if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(e))return t({success:!1,message:Drupal.t("Enter your birthday MM/DD/YYYY!")});if(n=e.split("/"),a=parseInt(n[0]),i=parseInt(n[1]),s=parseInt(n[2]),a>12||0==a)return t({success:!1,message:Drupal.t("That doesn't seem right.")});var r=[0,31,28,31,30,31,30,31,31,30,31,30,31];if((s%4==0&&s%100!=0||s%400==0)&&(r[2]=29),i>r[a])return t({success:!1,message:Drupal.t("That doesn't seem right.")});var o=new Date(s,a-1,i),l=new Date,c=l.getFullYear()-o.getFullYear(),u=l.getMonth()-o.getMonth();return(0>u||0===u&&l.getDate()<o.getDate())&&c--,t(0>c?{success:!1,message:Drupal.t("Are you a time traveller?")}:c>0&&25>=c?o.getMonth()===l.getMonth()&&l.getDate()===o.getDate()?{success:!0,message:Drupal.t("Wow, happy birthday!")}:10>c?{success:!0,message:Drupal.t("Wow, you're @age!",{"@age":c})}:{success:!0,message:Drupal.t("Cool, @age!",{"@age":c})}:c>25&&130>c?{success:!0,message:Drupal.t("Got it!")}:""===e?{success:!1,message:Drupal.t("We need your birthday.")}:{success:!1,message:Drupal.t("That doesn't seem right.")})}),n.registerValidationFunction("email",function(e,n){return t(e)?void a.run({email:e,domains:["yahoo.com","google.com","hotmail.com","gmail.com","me.com","aol.com","mac.com","live.com","comcast.net","googlemail.com","msn.com","hotmail.co.uk","yahoo.co.uk","facebook.com","verizon.net","sbcglobal.net","att.net","gmx.com","mail.com","outlook.com","aim.com","ymail.com","rocketmail.com","bellsouth.net","cox.net","charter.net","me.com","earthlink.net","optonline.net","dosomething.org"],suggested:function(e){return n({success:!0,suggestion:e})},empty:function(){return n({success:!0,message:Drupal.t("Great, thanks!")})}}):n({success:!1,message:Drupal.t("We need a valid email.")})}),n.registerValidationFunction("password",function(e,t){return t(e.length>=6?{success:!0,message:Drupal.t("Keep it secret, keep it safe!")}:{success:!1,message:Drupal.t("Must be 6+ characters.")})}),n.registerValidationFunction("phone",function(e,t){var n=e.replace(/[^0-9]/g,""),a=/^(?:\+?1([\-\s\.]{1})?)?\(?([0-9]{3})\)?(?:[\-\s\.]{1})?([0-9]{3})(?:[\-\s\.]{1})?([0-9]{4})/.test(e),i=/([0-9]{1})\1{9,}/.test(n);return t(a&&!i?{success:!0,message:Drupal.t("Thanks!")}:{success:!1,message:Drupal.t("Enter a valid telephone number.")})})}),define("validation/reportback",["require","neue/validation"],function(e){var t=e("neue/validation");t.registerValidationFunction("positiveInteger",function(e,t){var n=e.replace(" ","");return t(""!==n&&/^[1-9]\d*$/.test(n)?{success:!0,message:Drupal.t("That's great!")}:{success:!1,message:Drupal.t("Enter a valid number!")})}),t.registerValidationFunction("reportbackReason",function(e,t){return t(""!==e?{success:!0,message:Drupal.t("Thanks for caring!")}:{success:!1,message:Drupal.t("Tell us why you cared!")})})}),define("validation/address",["require","jquery","neue/validation"],function(e){var t=e("jquery"),n=e("neue/validation"),a=function(e,t,n){return t(""!==e?{success:!0,message:n.success}:{success:!1,message:n.failure})};n.registerValidationFunction("fname",function(e,t){return a(e,t,{success:Drupal.t("Oh hey, @fname!",{"@fname":e}),failure:Drupal.t("We need your name. We’re on a first-name basis, right?")})}),n.registerValidationFunction("lname",function(e,t){return a(e,t,{success:Drupal.t("The @lname-inator! People call you that, right?",{"@lname":e}),failure:Drupal.t("We need your last name.")})}),n.registerValidationFunction("address1",function(e,t){return a(e,t,{success:Drupal.t("Got it!"),failure:Drupal.t("We need your street name and number.")})}),n.registerValidationFunction("address2",function(e,t){return a(e,t,{success:Drupal.t("Got that too!"),failure:""})}),n.registerValidationFunction("city",function(e,t){return a(e,t,{success:Drupal.t("Sweet, thanks!"),failure:Drupal.t("We need your city.")})}),n.registerValidationFunction("state",function(e,t){return a(e,t,{success:Drupal.t("I ❤ @state",{"@state":e}),failure:Drupal.t("We need your state.")})}),n.registerValidationFunction("zipcode",function(e,t){return t(e.match(/^\d{5}(?:[-\s]\d{4})?$/)?{success:!0,message:Drupal.t("Almost done!")}:{success:!1,message:Drupal.t("We need your zip code.")})}),n.registerValidationFunction("why_signedup",function(e,t){return a(e,t,{success:Drupal.t("Thanks for caring!"),failure:Drupal.t("Oops! Can't leave this one blank.")})}),n.registerValidationFunction("ups_address",function(e,a){var i=t("<div class='messages error'><strong>"+Drupal.t("We couldn't find that address.")+"</strong>"+Drupal.t("Double check for typos and try submitting again.")+"</div>"),s=t("<div class='messages error'>"+Drupal.t("We're having trouble submitting the form, are you sure your internet connection is working? Email us if you continue having problems.")+"</div>"),r=e.find("select, input").serializeArray();e.find(".messages").slideUp(function(){t(this).remove()}),t.ajax({type:"POST",url:"/user/validate/address",dataType:"json",data:r,success:function(t){if(t.sorry)return e.append(i).hide().slideDown(),a({success:!1});var s=!1;for(var r in t)if(t.hasOwnProperty(r)&&"ambiguous"!==r){var o=t[r],l=e.find("[name='user_address["+r+"]']");"postal_code"===r&&l.val().slice(0,4)===o.slice(0,4)||o===l.val().toUpperCase()?l.val(o):(s=!0,n.showValidationMessage(l,{success:!1,suggestion:{full:o,domain:"zip"}}))}a(s?{success:!1}:{success:!0})},error:function(){e.append(s).hide().slideDown(),a({success:!1})}})})}),define("Analytics",["neue/events"],function(e){"undefined"!=typeof _gaq&&null!==_gaq&&(e.subscribe("Validation:InlineError",function(e,t){_gaq.push(["_trackEvent","Form","Inline Validation Error",t,null,!0])}),e.subscribe("Validation:Suggestion",function(e,t){_gaq.push(["_trackEvent","Form","Suggestion",t,null,!0])}),e.subscribe("Validation:SuggestionUsed",function(e,t){_gaq.push(["_trackEvent","Form","Suggestion Used",t,null,!0])}),e.subscribe("Validation:Submitted",function(e,t){_gaq.push(["_trackEvent","Form","Submitted",t,null,!1])}),e.subscribe("Validation:SubmitError",function(e,t){_gaq.push(["_trackEvent","Form","Validation Error on submit",t,null,!0])}),e.subscribe("Modal:Open",function(e,t){_gaq.push(["_trackEvent","Modal","Open","#"+t.attr("id"),null,!0])}),e.subscribe("Modal:Close",function(e,t){_gaq.push(["_trackEvent","Modal","Close","#"+t.attr("id"),null,!0])}))}),define("tiles",["require","jquery"],function(e){var t=e("jquery");t(".tile").find("img").unveil(200,function(){t(this).load(function(){this.style.opacity=1})})}),define("app",["require","jquery","finder/Finder","neue/main","campaign/sources","campaign/tips","campaign/tabs","campaign/ImageUploader","validation/auth","validation/reportback","validation/address","Analytics","tiles"],function(e){var t=e("jquery"),n=e("finder/Finder");e("neue/main"),e("campaign/sources"),e("campaign/tips"),e("campaign/tabs"),e("campaign/ImageUploader"),e("validation/auth"),e("validation/reportback"),e("validation/address"),e("Analytics"),e("tiles"),t(document).ready(function(){var e=t(".js-finder-form"),a=t(".js-campaign-results"),i=t(".js-campaign-blankslate");t(".js-finder-form").length&&n.init(e,a,i)})}),require(["app"]);
//# sourceMappingURL=app.js.map