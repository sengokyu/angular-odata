'use strict';

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

customElements.define('compodoc-menu', /*#__PURE__*/function (_HTMLElement) {
  _inherits(_class, _HTMLElement);

  var _super = _createSuper(_class);

  function _class() {
    var _this;

    _classCallCheck(this, _class);

    _this = _super.call(this);
    _this.isNormalMode = _this.getAttribute('mode') === 'normal';
    return _this;
  }

  _createClass(_class, [{
    key: "connectedCallback",
    value: function connectedCallback() {
      this.render(this.isNormalMode);
    }
  }, {
    key: "render",
    value: function render(isNormalMode) {
      var tp = lithtml.html("\n        <nav>\n            <ul class=\"list\">\n                <li class=\"title\">\n                    <a href=\"index.html\" data-type=\"index-link\">angular-odata documentation</a>\n                </li>\n\n                <li class=\"divider\"></li>\n                ".concat(isNormalMode ? "<div id=\"book-search-input\" role=\"search\"><input type=\"text\" placeholder=\"Type to search\"></div>" : '', "\n                <li class=\"chapter\">\n                    <a data-type=\"chapter-link\" href=\"index.html\"><span class=\"icon ion-ios-home\"></span>Getting started</a>\n                    <ul class=\"links\">\n                        <li class=\"link\">\n                            <a href=\"overview.html\" data-type=\"chapter-link\">\n                                <span class=\"icon ion-ios-keypad\"></span>Overview\n                            </a>\n                        </li>\n                        <li class=\"link\">\n                            <a href=\"index.html\" data-type=\"chapter-link\">\n                                <span class=\"icon ion-ios-paper\"></span>README\n                            </a>\n                        </li>\n                        <li class=\"link\">\n                            <a href=\"license.html\"  data-type=\"chapter-link\">\n                                <span class=\"icon ion-ios-paper\"></span>LICENSE\n                            </a>\n                        </li>\n                                <li class=\"link\">\n                                    <a href=\"dependencies.html\" data-type=\"chapter-link\">\n                                        <span class=\"icon ion-ios-list\"></span>Dependencies\n                                    </a>\n                                </li>\n                    </ul>\n                </li>\n                    <li class=\"chapter modules\">\n                        <a data-type=\"chapter-link\" href=\"modules.html\">\n                            <div class=\"menu-toggler linked\" data-toggle=\"collapse\" ").concat(isNormalMode ? 'data-target="#modules-links"' : 'data-target="#xs-modules-links"', ">\n                                <span class=\"icon ion-ios-archive\"></span>\n                                <span class=\"link-name\">Modules</span>\n                                <span class=\"icon ion-ios-arrow-down\"></span>\n                            </div>\n                        </a>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"', ">\n                            <li class=\"link\">\n                                <a href=\"modules/ODataModule.html\" data-type=\"entity-link\" >ODataModule</a>\n                                <li class=\"chapter inner\">\n                                    <div class=\"simple menu-toggler\" data-toggle=\"collapse\" ").concat(isNormalMode ? 'data-target="#injectables-links-module-ODataModule-526d93906693bfb2830d92fdc9e5db72"' : 'data-target="#xs-injectables-links-module-ODataModule-526d93906693bfb2830d92fdc9e5db72"', ">\n                                        <span class=\"icon ion-md-arrow-round-down\"></span>\n                                        <span>Injectables</span>\n                                        <span class=\"icon ion-ios-arrow-down\"></span>\n                                    </div>\n                                    <ul class=\"links collapse\" ").concat(isNormalMode ? 'id="injectables-links-module-ODataModule-526d93906693bfb2830d92fdc9e5db72"' : 'id="xs-injectables-links-module-ODataModule-526d93906693bfb2830d92fdc9e5db72"', ">\n                                        <li class=\"link\">\n                                            <a href=\"injectables/ODataClient.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >ODataClient</a>\n                                        </li>\n                                        <li class=\"link\">\n                                            <a href=\"injectables/ODataServiceFactory.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >ODataServiceFactory</a>\n                                        </li>\n                                    </ul>\n                                </li>\n                            </li>\n                </ul>\n                </li>\n                    <li class=\"chapter\">\n                        <div class=\"simple menu-toggler\" data-toggle=\"collapse\" ").concat(isNormalMode ? 'data-target="#classes-links"' : 'data-target="#xs-classes-links"', ">\n                            <span class=\"icon ion-ios-paper\"></span>\n                            <span>Classes</span>\n                            <span class=\"icon ion-ios-arrow-down\"></span>\n                        </div>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"', ">\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlAction.html\" data-type=\"entity-link\" >CsdlAction</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlActionImport.html\" data-type=\"entity-link\" >CsdlActionImport</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlAnnotable.html\" data-type=\"entity-link\" >CsdlAnnotable</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlAnnotation.html\" data-type=\"entity-link\" >CsdlAnnotation</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlAnnotations.html\" data-type=\"entity-link\" >CsdlAnnotations</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlComplexType.html\" data-type=\"entity-link\" >CsdlComplexType</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlEntityContainer.html\" data-type=\"entity-link\" >CsdlEntityContainer</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlEntitySet.html\" data-type=\"entity-link\" >CsdlEntitySet</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlEntityType.html\" data-type=\"entity-link\" >CsdlEntityType</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlEnumMember.html\" data-type=\"entity-link\" >CsdlEnumMember</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlEnumType.html\" data-type=\"entity-link\" >CsdlEnumType</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlFunction.html\" data-type=\"entity-link\" >CsdlFunction</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlFunctionImport.html\" data-type=\"entity-link\" >CsdlFunctionImport</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlInclude.html\" data-type=\"entity-link\" >CsdlInclude</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlIncludeAnnotations.html\" data-type=\"entity-link\" >CsdlIncludeAnnotations</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlKey.html\" data-type=\"entity-link\" >CsdlKey</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlNavigationProperty.html\" data-type=\"entity-link\" >CsdlNavigationProperty</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlNavigationPropertyBinding.html\" data-type=\"entity-link\" >CsdlNavigationPropertyBinding</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlOnDelete.html\" data-type=\"entity-link\" >CsdlOnDelete</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlParameter.html\" data-type=\"entity-link\" >CsdlParameter</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlProperty.html\" data-type=\"entity-link\" >CsdlProperty</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlPropertyRef.html\" data-type=\"entity-link\" >CsdlPropertyRef</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlReference.html\" data-type=\"entity-link\" >CsdlReference</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlReferentialConstraint.html\" data-type=\"entity-link\" >CsdlReferentialConstraint</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlReturnType.html\" data-type=\"entity-link\" >CsdlReturnType</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlSchema.html\" data-type=\"entity-link\" >CsdlSchema</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlSingleton.html\" data-type=\"entity-link\" >CsdlSingleton</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlStructuralProperty.html\" data-type=\"entity-link\" >CsdlStructuralProperty</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlStructuredType.html\" data-type=\"entity-link\" >CsdlStructuredType</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlTerm.html\" data-type=\"entity-link\" >CsdlTerm</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/CsdlTypeDefinition.html\" data-type=\"entity-link\" >CsdlTypeDefinition</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/Field.html\" data-type=\"entity-link\" >Field</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataActionResource.html\" data-type=\"entity-link\" >ODataActionResource</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataAnnotation.html\" data-type=\"entity-link\" >ODataAnnotation</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataAnnotations.html\" data-type=\"entity-link\" >ODataAnnotations</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataApi.html\" data-type=\"entity-link\" >ODataApi</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataApiOptions.html\" data-type=\"entity-link\" >ODataApiOptions</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataBaseService.html\" data-type=\"entity-link\" >ODataBaseService</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataBatchRequest.html\" data-type=\"entity-link\" >ODataBatchRequest</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataBatchResource.html\" data-type=\"entity-link\" >ODataBatchResource</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataCache.html\" data-type=\"entity-link\" >ODataCache</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataCallable.html\" data-type=\"entity-link\" >ODataCallable</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataCallableParser.html\" data-type=\"entity-link\" >ODataCallableParser</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataCollection.html\" data-type=\"entity-link\" >ODataCollection</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataCountResource.html\" data-type=\"entity-link\" >ODataCountResource</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataEntitiesAnnotations.html\" data-type=\"entity-link\" >ODataEntitiesAnnotations</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataEntityAnnotations.html\" data-type=\"entity-link\" >ODataEntityAnnotations</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataEntityContainer.html\" data-type=\"entity-link\" >ODataEntityContainer</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataEntityResource.html\" data-type=\"entity-link\" >ODataEntityResource</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataEntityService.html\" data-type=\"entity-link\" >ODataEntityService</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataEntitySet.html\" data-type=\"entity-link\" >ODataEntitySet</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataEntitySetResource.html\" data-type=\"entity-link\" >ODataEntitySetResource</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataEntitySetService.html\" data-type=\"entity-link\" >ODataEntitySetService</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataEntityTypeKey.html\" data-type=\"entity-link\" >ODataEntityTypeKey</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataEnumType.html\" data-type=\"entity-link\" >ODataEnumType</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataEnumTypeFieldParser.html\" data-type=\"entity-link\" >ODataEnumTypeFieldParser</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataEnumTypeParser.html\" data-type=\"entity-link\" >ODataEnumTypeParser</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataFunctionResource.html\" data-type=\"entity-link\" >ODataFunctionResource</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataInMemoryCache.html\" data-type=\"entity-link\" >ODataInMemoryCache</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataInStorageCache.html\" data-type=\"entity-link\" >ODataInStorageCache</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataMediaResource.html\" data-type=\"entity-link\" >ODataMediaResource</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataMetadata.html\" data-type=\"entity-link\" >ODataMetadata</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataMetadataResource.html\" data-type=\"entity-link\" >ODataMetadataResource</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataModel.html\" data-type=\"entity-link\" >ODataModel</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataModelField.html\" data-type=\"entity-link\" >ODataModelField</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataModelOptions.html\" data-type=\"entity-link\" >ODataModelOptions</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataNavigationPropertyResource.html\" data-type=\"entity-link\" >ODataNavigationPropertyResource</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataParameterParser.html\" data-type=\"entity-link\" >ODataParameterParser</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataParserOptions.html\" data-type=\"entity-link\" >ODataParserOptions</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataPathSegments.html\" data-type=\"entity-link\" >ODataPathSegments</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataPropertyAnnotations.html\" data-type=\"entity-link\" >ODataPropertyAnnotations</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataPropertyResource.html\" data-type=\"entity-link\" >ODataPropertyResource</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataQueryOptions.html\" data-type=\"entity-link\" >ODataQueryOptions</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataReferenceResource.html\" data-type=\"entity-link\" >ODataReferenceResource</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataReferential.html\" data-type=\"entity-link\" >ODataReferential</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataRequest.html\" data-type=\"entity-link\" >ODataRequest</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataResource.html\" data-type=\"entity-link\" >ODataResource</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataResponse.html\" data-type=\"entity-link\" >ODataResponse</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataResponseOptions.html\" data-type=\"entity-link\" >ODataResponseOptions</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataSchema.html\" data-type=\"entity-link\" >ODataSchema</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataSettings.html\" data-type=\"entity-link\" >ODataSettings</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataSingletonResource.html\" data-type=\"entity-link\" >ODataSingletonResource</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataSingletonService.html\" data-type=\"entity-link\" >ODataSingletonService</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataStructuredType.html\" data-type=\"entity-link\" >ODataStructuredType</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataStructuredTypeFieldParser.html\" data-type=\"entity-link\" >ODataStructuredTypeFieldParser</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataStructuredTypeParser.html\" data-type=\"entity-link\" >ODataStructuredTypeParser</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ODataValueResource.html\" data-type=\"entity-link\" >ODataValueResource</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/OptionHandler.html\" data-type=\"entity-link\" >OptionHandler</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/SegmentHandler.html\" data-type=\"entity-link\" >SegmentHandler</a>\n                            </li>\n                        </ul>\n                    </li>\n                        <li class=\"chapter\">\n                            <div class=\"simple menu-toggler\" data-toggle=\"collapse\" ").concat(isNormalMode ? 'data-target="#injectables-links"' : 'data-target="#xs-injectables-links"', ">\n                                <span class=\"icon ion-md-arrow-round-down\"></span>\n                                <span>Injectables</span>\n                                <span class=\"icon ion-ios-arrow-down\"></span>\n                            </div>\n                            <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"', ">\n                                <li class=\"link\">\n                                    <a href=\"injectables/ODataServiceFactory.html\" data-type=\"entity-link\" >ODataServiceFactory</a>\n                                </li>\n                            </ul>\n                        </li>\n                    <li class=\"chapter\">\n                        <div class=\"simple menu-toggler\" data-toggle=\"collapse\" ").concat(isNormalMode ? 'data-target="#interfaces-links"' : 'data-target="#xs-interfaces-links"', ">\n                            <span class=\"icon ion-md-information-circle-outline\"></span>\n                            <span>Interfaces</span>\n                            <span class=\"icon ion-ios-arrow-down\"></span>\n                        </div>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"', ">\n                            <li class=\"link\">\n                                <a href=\"interfaces/ApiOptions.html\" data-type=\"entity-link\" >ApiOptions</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/Cache.html\" data-type=\"entity-link\" >Cache</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/ODataCacheEntry.html\" data-type=\"entity-link\" >ODataCacheEntry</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/ODataVersionHelper.html\" data-type=\"entity-link\" >ODataVersionHelper</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/Options.html\" data-type=\"entity-link\" >Options</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/OptionsHelper.html\" data-type=\"entity-link\" >OptionsHelper</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/Parser.html\" data-type=\"entity-link\" >Parser</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/ResponseOptions.html\" data-type=\"entity-link\" >ResponseOptions</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/StoragePayload.html\" data-type=\"entity-link\" >StoragePayload</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/StructuredTypeFieldOptions.html\" data-type=\"entity-link\" >StructuredTypeFieldOptions</a>\n                            </li>\n                        </ul>\n                    </li>\n                    <li class=\"chapter\">\n                        <div class=\"simple menu-toggler\" data-toggle=\"collapse\" ").concat(isNormalMode ? 'data-target="#miscellaneous-links"' : 'data-target="#xs-miscellaneous-links"', ">\n                            <span class=\"icon ion-ios-cube\"></span>\n                            <span>Miscellaneous</span>\n                            <span class=\"icon ion-ios-arrow-down\"></span>\n                        </div>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"', ">\n                            <li class=\"link\">\n                                <a href=\"miscellaneous/enumerations.html\" data-type=\"entity-link\">Enums</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"miscellaneous/functions.html\" data-type=\"entity-link\">Functions</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"miscellaneous/typealiases.html\" data-type=\"entity-link\">Type aliases</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"miscellaneous/variables.html\" data-type=\"entity-link\">Variables</a>\n                            </li>\n                        </ul>\n                    </li>\n                    <li class=\"divider\"></li>\n                    <li class=\"copyright\">\n                        Documentation generated using <a href=\"https://compodoc.app/\" target=\"_blank\">\n                            <img data-src=\"images/compodoc-vectorise.png\" class=\"img-responsive\" data-type=\"compodoc-logo\">\n                        </a>\n                    </li>\n            </ul>\n        </nav>\n        "));
      this.innerHTML = tp.strings;
    }
  }]);

  return _class;
}( /*#__PURE__*/_wrapNativeSuper(HTMLElement)));