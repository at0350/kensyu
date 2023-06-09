import Color from "../../Core/Color.js";
import defined from "../../Core/defined.js";

/**
 * A feature of a {@link Model}.
 * <p>
 * Provides access to a feature's properties stored in the model's feature table.
 * </p>
 * <p>
 * Modifications to a <code>ModelFeature</code> object have the lifetime of the model.
 * </p>
 * <p>
 * Do not construct this directly. Access it through picking using {@link Scene#pick}.
 * </p>
 *
 * @alias ModelFeature
 * @constructor
 *
 * @param {object} options Object with the following properties:
 * @param {Model} options.model The model the feature belongs to.
 * @param {number} options.featureId The unique integral identifier for this feature.
 *
 * @example
 * // On mouse over, display all the properties for a feature in the console log.
 * handler.setInputAction(function(movement) {
 *     const feature = scene.pick(movement.endPosition);
 *     if (feature instanceof Cesium.ModelFeature) {
 *         console.log(feature);
 *     }
 * }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
 *
 */
function ModelFeature(options) {
  this._model = options.model;

  // This ModelFeatureTable is not documented as an option since it is
  // part of the private API and should not appear in the documentation.
  this._featureTable = options.featureTable;

  this._featureId = options.featureId;
  this._color = undefined; // for calling getColor
}

Object.defineProperties(ModelFeature.prototype, {
  /**
   * Gets or sets if the feature will be shown. This is set for all features
   * when a style's show is evaluated.
   *
   * @memberof ModelFeature.prototype
   *
   * @type {boolean}
   *
   * @default true
   */
  show: {
    get: function () {
      return this._featureTable.getShow(this._featureId);
    },
    set: function (value) {
      this._featureTable.setShow(this._featureId, value);
    },
  },

  /**
   * Gets or sets the highlight color multiplied with the feature's color.  When
   * this is white, the feature's color is not changed. This is set for all features
   * when a style's color is evaluated.
   *
   * @memberof ModelFeature.prototype
   *
   * @type {Color}
   *
   * @default {@link Color.WHITE}
   */
  color: {
    get: function () {
      if (!defined(this._color)) {
        this._color = new Color();
      }
      return this._featureTable.getColor(this._featureId, this._color);
    },
    set: function (value) {
      this._featureTable.setColor(this._featureId, value);
    },
  },
  /**
   * All objects returned by {@link Scene#pick} have a <code>primitive</code> property. This returns
   * the model containing the feature.
   *
   * @memberof ModelFeature.prototype
   *
   * @type {Model}
   *
   * @readonly
   * @private
   */
  primitive: {
    get: function () {
      return this._model;
    },
  },

  /**
   *  The {@link ModelFeatureTable} that this feature belongs to.
   *
   * @memberof ModelFeature.prototype
   *
   * @type {ModelFeatureTable}
   *
   * @readonly
   * @private
   */
  featureTable: {
    get: function () {
      return this._featureTable;
    },
  },

  /**
   * Get the feature ID associated with this feature. For 3D Tiles 1.0, the
   * batch ID is returned. For EXT_mesh_features, this is the feature ID from
   * the selected feature ID set.
   *
   * @memberof ModelFeature.prototype
   *
   * @type {number}
   *
   * @readonly
   * @experimental This feature is using part of the 3D Tiles spec that is not final and is subject to change without Cesium's standard deprecation policy.
   */
  featureId: {
    get: function () {
      return this._featureId;
    },
  },
});

/**
 * Returns whether the feature contains this property.
 *
 * @param {string} name The case-sensitive name of the property.
 * @returns {boolean} Whether the feature contains this property.
 */
ModelFeature.prototype.hasProperty = function (name) {
  return this._featureTable.hasProperty(this._featureId, name);
};

/**
 * Returns a copy of the value of the feature's property with the given name.
 *
 * @param {string} name The case-sensitive name of the property.
 * @returns {*} The value of the property or <code>undefined</code> if the feature does not have this property.
 *
 * @example
 * // Display all the properties for a feature in the console log.
 * const propertyIds = feature.getPropertyIds();
 * const length = propertyIds.length;
 * for (let i = 0; i < length; ++i) {
 *     const propertyId = propertyIds[i];
 *     console.log(propertyId + ': ' + feature.getProperty(propertyId));
 * }
 */
ModelFeature.prototype.getProperty = function (name) {
  return this._featureTable.getProperty(this._featureId, name);
};

/**
 * Returns a copy of the feature's property with the given name, examining all
 * the metadata from the EXT_structural_metadata and legacy EXT_feature_metadata glTF
 * extensions. Metadata is checked against name from most specific to most
 * general and the first match is returned. Metadata is checked in this order:
 * <ol>
 *   <li>structural metadata property by semantic</li>
 *   <li>structural metadata property by property ID</li>
 * </ol>
 * <p>
 * See the {@link https://github.com/CesiumGS/glTF/tree/3d-tiles-next/extensions/2.0/Vendor/EXT_structural_metadata|EXT_structural_metadata Extension} as well as the
 * previous {@link https://github.com/CesiumGS/glTF/tree/3d-tiles-next/extensions/2.0/Vendor/EXT_feature_metadata|EXT_feature_metadata Extension} for glTF.
 * </p>
 *
 * @param {string} name The semantic or property ID of the feature. Semantics are checked before property IDs in each granularity of metadata.
 * @return {*} The value of the property or <code>undefined</code> if the feature does not have this property.
 *
 * @experimental This feature is using part of the 3D Tiles spec that is not final and is subject to change without Cesium's standard deprecation policy.
 */
ModelFeature.prototype.getPropertyInherited = function (name) {
  if (this._featureTable.hasPropertyBySemantic(this._featureId, name)) {
    return this._featureTable.getPropertyBySemantic(this._featureId, name);
  }

  return this._featureTable.getProperty(this._featureId, name);
};

/**
 * Returns an array of property IDs for the feature.
 *
 * @param {string[]} [results] An array into which to store the results.
 * @returns {string[]} The IDs of the feature's properties.
 */
ModelFeature.prototype.getPropertyIds = function (results) {
  return this._featureTable.getPropertyIds(results);
};

/**
 * Sets the value of the feature's property with the given name.
 *
 * @param {string} name The case-sensitive name of the property.
 * @param {*} value The value of the property that will be copied.
 * @returns {boolean} <code>true</code> if the property was set, <code>false</code> otherwise.
 *
 * @exception {DeveloperError} Inherited batch table hierarchy property is read only.
 *
 * @example
 * const height = feature.getProperty('Height'); // e.g., the height of a building
 *
 * @example
 * const name = 'clicked';
 * if (feature.getProperty(name)) {
 *     console.log('already clicked');
 * } else {
 *     feature.setProperty(name, true);
 *     console.log('first click');
 * }
 */
ModelFeature.prototype.setProperty = function (name, value) {
  return this._featureTable.setProperty(this._featureId, name, value);
};

export default ModelFeature;
