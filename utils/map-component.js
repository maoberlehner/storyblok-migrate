module.exports = function mapComponent({
  allPresets = [],
  displayName,
  image,
  previewField,
  schema,
  settings = {},
  name,
}) {
  return {
    all_presets: allPresets,
    display_name: displayName,
    image,
    is_nestable: settings.nestable,
    is_root: settings.root,
    name,
    preview_field: previewField,
    real_name: displayName,
    schema,
  };
};
